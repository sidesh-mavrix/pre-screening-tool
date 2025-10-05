import axios from 'axios';
import config from '../config';

export const translateText = async (text, targetLang, sourceLang = 'en-US') => {
  try {
    if (!text || text.trim() === '') return text;
    if (targetLang === sourceLang) return text;
    
    const response = await axios.post(`${config.API_BASE_URL}/translate`, {
      text,
      targetLang,
      sourceLang
    });
    
    return response.data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

export const translateBatch = async (texts, targetLang, sourceLang = 'en-US') => {
  try {
    const response = await axios.post(`${config.API_BASE_URL}/translate/batch`, {
      texts,
      targetLang,
      sourceLang
    });
    
    return response.data.translations;
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts;
  }
};