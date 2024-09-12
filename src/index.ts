import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';

// Load environment variables from .env file
dotenv.config();

// Function to read markdown files from a directory
function readMarkdownFiles(dir: string): string[] {
  const files = fs.readdirSync(dir);
  return files.filter(file => path.extname(file).toLowerCase() === '.md');
}

// Function to extract local image paths from markdown content
function extractLocalImages(content: string): string[] {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const matches = content.match(regex);
  return matches
    ? matches
        .map(match => match.replace(/!\[.*?\]\((.*?)\)/, '$1'))
        .filter(path => !path.startsWith('http'))
    : [];
}

// Function to upload an image to a free image server (e.g., ImgBB)
async function uploadImage(imagePath: string): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY;
  
  if (!apiKey) {
    throw new Error('IMGBB_API_KEY is not set in the environment variables');
  }
    
  try {
    const imageFile = fs.createReadStream(imagePath);
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData, {
      headers: formData.getHeaders()
    });
    
    return response.data.data.url;
  } catch (error) {
    console.error(`Error uploading image ${imagePath}:`, error);
    return '';
  }
}

// Function to replace local image links with uploaded image URLs
function replaceImageLinks(content: string, localPath: string, remoteUrl: string): string {
  return content.replace(localPath,remoteUrl);
}

// Main function to process markdown files
async function processMarkdownFiles(dir: string): Promise<void> {
  const files = readMarkdownFiles(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const localImages = extractLocalImages(content);
    
    for (const imagePath of localImages) {
      //const fullImagePath = path.join(dir, imagePath);
      const remoteUrl = await uploadImage(imagePath);
      
      if (remoteUrl) {
        content = replaceImageLinks(content, imagePath, remoteUrl);
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Processed ${file}`);
  }
}

// Usage
const directoryPath = process.env.MARKDOWN_DIRECTORY || './markdown-files';
processMarkdownFiles(directoryPath).then(() => {
  console.log('All markdown files processed successfully.');
}).catch(error => {
  console.error('An error occurred:', error);
});