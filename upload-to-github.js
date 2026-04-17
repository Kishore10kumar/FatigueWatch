import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== '.replit' && file !== 'attached_assets' && file !== 'temp' && !file.startsWith('.')) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        }
      } else {
        arrayOfFiles.push(fullPath);
      }
    } catch (e) {
      // Skip files that can't be accessed
    }
  });

  return arrayOfFiles;
}

async function uploadFile(octokit, owner, repo, filePath, content) {
  try {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`Uploading ${relativePath}...`);
    
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: relativePath,
      });
      if (!Array.isArray(data)) {
        sha = data.sha;
      }
    } catch (e) {}

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: relativePath,
      message: `Sync ${relativePath}`,
      content: Buffer.from(content).toString('base64'),
      branch: 'main',
      sha: sha
    });
    
    console.log(`✅ Uploaded ${relativePath}`);
  } catch (error) {
    console.error(`❌ Failed to upload ${filePath}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting full project upload to GitHub...\n');
  
  try {
    const octokit = await getGitHubClient();
    console.log('✅ Connected to GitHub\n');
    
    const owner = 'Kishore10kumar';
    const repo = 'FatigueWatch';
    
    const allFiles = getAllFiles(process.cwd());
    
    for (const filePath of allFiles) {
      const fileName = path.basename(filePath);
      if (fileName === 'upload-to-github.js' || fileName === '.DS_Store' || fileName.endsWith('.log')) continue;
      
      const content = fs.readFileSync(filePath);
      await uploadFile(octokit, owner, repo, filePath, content);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('\n✅ Full upload complete!');
    console.log(`🎉 Check your repository at: https://github.com/${owner}/${repo}`);
  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
  }
}

main();
