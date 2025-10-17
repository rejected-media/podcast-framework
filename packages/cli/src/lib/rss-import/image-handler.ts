/**
 * Image download and upload handler for RSS import
 */

import type { SanityClient } from '@sanity/client';
import { ImportLogger } from './logger';

export class ImageHandler {
  private client: SanityClient;
  private logger: ImportLogger;

  constructor(client: SanityClient, logger: ImportLogger) {
    this.client = client;
    this.logger = logger;
  }

  /**
   * Download image from URL and upload to Sanity
   * Returns the Sanity asset document
   */
  async uploadImageFromUrl(imageUrl: string, filename?: string): Promise<any> {
    try {
      this.logger.info(`Downloading image: ${imageUrl}`);

      // Fetch the image
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      // Get the blob
      const blob = await response.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());

      // Determine filename
      const ext = this.getExtensionFromUrl(imageUrl) || 'jpg';
      const name = filename || `image-${Date.now()}.${ext}`;

      this.logger.info(`Uploading image to Sanity: ${name}`);

      // Upload to Sanity
      const asset = await this.client.assets.upload('image', buffer, {
        filename: name,
      });

      this.logger.info(`Image uploaded successfully: ${asset._id}`);

      return {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to upload image from ${imageUrl}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract file extension from URL
   */
  private getExtensionFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const match = pathname.match(/\.([a-z0-9]+)$/i);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
