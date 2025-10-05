import { Injectable } from '@nestjs/common';
const { translate } = require('@vitalets/google-translate-api');

const LANGUAGE_MAP = {
  'en-US': 'en', 'en-GB': 'en', 'es-ES': 'es', 'es-MX': 'es', 'fr-FR': 'fr', 'de-DE': 'de',
  'it-IT': 'it', 'pt-BR': 'pt', 'ja-JP': 'ja', 'ko-KR': 'ko', 'zh-CN': 'zh-cn', 'zh-TW': 'zh-tw',
  'ru-RU': 'ru', 'ar-SA': 'ar', 'hi-IN': 'hi', 'th-TH': 'th', 'vi-VN': 'vi', 'nl-NL': 'nl',
  'sv-SE': 'sv', 'da-DK': 'da', 'no-NO': 'no', 'fi-FI': 'fi', 'pl-PL': 'pl', 'tr-TR': 'tr'
};

@Injectable()
export class TranslateService {
  async translateText(text: string, targetLang: string, sourceLang = 'en-US') {
    try {
      if (!text?.trim()) return { translatedText: text };
      
      const targetCode = LANGUAGE_MAP[targetLang] || targetLang.split('-')[0];
      const sourceCode = LANGUAGE_MAP[sourceLang] || sourceLang.split('-')[0];
      
      if (targetCode === sourceCode) return { translatedText: text };
      
      const result = await translate(text, { from: sourceCode, to: targetCode });
      return { translatedText: result.text };
    } catch (error) {
      console.error('Translation error:', error);
      return { translatedText: text };
    }
  }

  async translateBatch(texts: string[], targetLang: string, sourceLang = 'en-US') {
    try {
      const translations = await Promise.all(
        texts.map(text => this.translateText(text, targetLang, sourceLang))
      );
      return { translations: translations.map(t => t.translatedText) };
    } catch (error) {
      console.error('Batch translation error:', error);
      return { translations: texts };
    }
  }
}