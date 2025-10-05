const { translate } = require('@vitalets/google-translate-api');

async function testTranslation() {
  try {
    console.log('Testing translation...');
    
    const text = 'What is your age?';
    const result = await translate(text, { from: 'en', to: 'es' });
    
    console.log('Original:', text);
    console.log('Translated:', result.text);
    console.log('✅ Translation working!');
  } catch (error) {
    console.error('❌ Translation failed:', error.message);
  }
}

testTranslation();