import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService {
    private readonly secretKey: Buffer;
    private readonly secretjwt: Buffer;
    private readonly iv: Buffer;

    constructor(private readonly configService: ConfigService) {
        this.secretKey = crypto.createHash('sha256')
            .update(this.configService.get('SECRET_KEY'))
            .digest();
        this.secretjwt = crypto.createHash('sha256')
            .update(this.configService.get('SECRET_JWT'))
            .digest();

        const ivFromEnv = this.configService.get('IV_INIT');  // Get IV from env

        // Ensure IV is a valid 16-byte buffer
        if (ivFromEnv.length === 32 && /^[0-9a-fA-F]+$/.test(ivFromEnv)) {
            this.iv = Buffer.from(ivFromEnv, 'hex');  // Use hex decoding
        } else if (ivFromEnv.length === 24) {
            this.iv = Buffer.from(ivFromEnv, 'base64');  // Use base64 decoding
        } else {
            throw new Error('IV_INIT must be a valid 16-byte hex or base64 string');
        }
    }

    encryptJwt(strapiJwt: string): string {
        const cipher = crypto.createCipheriv('aes-256-cbc', this.secretKey, this.iv);
        let encryptedStrapiJwt = cipher.update(strapiJwt, 'utf-8', 'hex');
        encryptedStrapiJwt += cipher.final('hex');
        return jwt.sign({ strapiJwt: encryptedStrapiJwt }, this.secretjwt);
    }

    decryptJwt(encryptedJwt: string): string {
        try {
            const payload = jwt.verify(encryptedJwt, this.secretjwt) as any;
            const decipher = crypto.createDecipheriv('aes-256-cbc', this.secretKey, this.iv);
            let decryptedStrapiJwt = decipher.update(payload.strapiJwt, 'hex', 'utf-8');
            decryptedStrapiJwt += decipher.final('utf-8');
            return decryptedStrapiJwt;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
}
