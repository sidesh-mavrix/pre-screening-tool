import React, { useState } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 90 });
  const [size, setSize] = useState({ width: 350, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const funnyGreetings = [
    "Looks like there's more workload! 😅 Don't worry, I'm here to help you survive this survey chaos!",
    "Another day, another survey to build! ☕ Let me be your digital coffee break - what do you need?",
    "Looks like there's no one to support you here... except me! 🤖 Ask me anything!",
    "Working late again? 🌙 Let me help you get through this survey stuff faster!",
    "Survey building got you stressed? 😰 Take a deep breath, I've got your back!",
    "Monday blues hitting hard? 💙 Let's make this survey work less painful together!",
    "Deadline approaching? ⏰ Don't panic! I'm here to speed things up for you!",
    "Feeling overwhelmed with all these questions? 🤯 That's literally what I'm here for!"
  ];

  const motivationalQuotes = [
    "Remember: Every expert was once a beginner! 🌟",
    "You're doing great! Rome wasn't built in a day, and neither are perfect surveys! 🏛️",
    "Coffee break reminder: You've got this! ☕💪",
    "Pro tip: The best surveys are made one question at a time! 📝",
    "Keep calm and survey on! 😎"
  ];

  const quickReplies = [
    'How to create a project?',
    'How to add questions?',
    'How to use templates?',
    'Error codes help',
    'Survey links format',
    'Redirect links format'
  ];

  const responses = {
    'how to create a project': 'Creating a project is easier than your morning coffee routine! ☕\n\n1) Hit that shiny "New Project" button\n2) Fill in the boring details (but make the name fun!)\n3) Pick countries & languages\n4) Add some killer questions\n5) Click "Create Project" and boom! 🎉',
    'how to add questions': 'Questions are like pizza toppings - the more creative, the better! 🍕\n\n1) Head to Questions section\n2) Click "Add Question" (the magic button)\n3) Pick your question type (single, multi, or text)\n4) Write something interesting\n5) Add options if needed\n6) Save and celebrate! 🎆',
    'how to use templates': 'Templates are like having a smart colleague who already did the work! 🧑‍💼\n\n1) Check out the template sidebar (left side)\n2) Browse categories like a Netflix menu\n3) Click the + button to add to your project\n4) Boom! Instant productivity boost! 🚀',
    'how to set up translations': 'Going global? I like your ambition! 🌍\n\n1) Add languages to your project\n2) Write everything in English first (keep it simple)\n3) Hit "Auto Translate All" for magic ✨\n4) Review translations (Google isn\'t perfect, but neither are we!) 😅',
    'how to configure skip logic': 'Skip logic = Survey ninja moves! 🥷\n\n1) Go to Logic tab in question builder\n2) Add conditions (if this, then that)\n3) Set actions: skip, terminate, or qualify\n4) Specify target questions\n5) Feel like a programming wizard! 🧙‍♂️',
    'error codes': '🚨 **Common Survey Error Codes:**\n\nJust type the error number (like "503" or "101") for detailed help!\n\n**503** - Overall quota reached\n**101** - General error, contact support\n**102** - ID already used elsewhere\n**103** - General error, contact support\n**105** - IP used multiple times\n**106** - IP changed during survey\n**Partner/Daily/Defined Quota** - Various quota limits reached\n**Test Link Issues** - Test limits exceeded\n**Invalid Panel/Country** - Setup issues in PMT portal\n**Survey Paused/Completed** - Status issues',
    'all errors': '**All Error Codes & Messages:**\n\n**503** - Overall response quota reached\n\n**101** - ID already registered (different partner/mode)\n\n**102** - ID already registered (different partner/mode)\n\n**103** - ID already registered (different partner/mode)\n\n**105** - IP used multiple times\n\n**106** - IP changed during survey\n\n**Partner Quota** - Partner quota achieved\n\n**Daily Quota** - Daily quota achieved\n\n**Defined Quota** - Quota limit reached\n\n**Test Link Used** - Test limit reached\n\n**Out of Test Links** - No test links available\n\n**Invalid Panel Code** - Panel setup issue\n\n**Invalid Country** - Country setup issue\n\n**Define Quota** - Quota not defined\n\n**Invalid Link** - Link variables missing/incorrect\n\n**Survey Paused** - Survey paused for country/partner\n\n**Survey Completed** - ID already completed/terminated',
    'redirect links': '🔗 **Project Redirect Links:**\n\n\n**Complete:**\nhttps://globalresearchstudy.com/projects/{PROJECT_CODE}_O/client_page.asp?trans_id={TRANS_ID}&s=1\n\n\n\n**Terminate:**\nhttps://globalresearchstudy.com/projects/{PROJECT_CODE}_O/client_page.asp?trans_id={TRANS_ID}&s=2\n\n\n\n**Overquota:**\nhttps://globalresearchstudy.com/projects/{PROJECT_CODE}_O/client_page.asp?trans_id={TRANS_ID}&s=3\n\n\n\n**Quality Terminate:**\nhttps://globalresearchstudy.com/projects/{PROJECT_CODE}_O/client_page.asp?trans_id={TRANS_ID}&s=4\n\n\n\n⚠️ Replace all {curly bracket} variables with actual values. No extra spaces!',
    'survey links': '🔗 **Survey Links:**\n\n**Main Survey Link:**\nhttp://globalresearchstudy.com/projects/{PROJECT_CODE}_o/pStart_Page.asp?PG={PGCODE}&CO={CO}&TRANS_ID={TRANS_ID}\n\n\n**Test Link:**\nhttp://globalresearchstudy.com/projects/{PROJECT_CODE}_o/pStart_Page.asp?PG={PGCODE}&CO={CO}&TRANS_ID={TRANS_ID}&itest=1\n\n\n⚠️ **Important:**\n• Replace {PROJECT_CODE}, {PGCODE}, {CO}, {TRANS_ID} with actual values\n• NO extra spaces between parameters',
    '503': '**Error 503:** Overall response quota has been reached. No more respondents can participate at this time. Contact support team or wait for further instructions.',
    '101': '**Message 101:** The respondent ID is already registered in our system. This may have occurred due to reusing an old ID from another partner or trying both test and live modes. Please try using a different unique ID.',
    '102': '**Message 102:** The respondent ID is already registered in our system. This may have occurred due to reusing an old ID from another partner or trying both test and live modes. Please try using a different unique ID.',
    '103': '**Message 103:** The respondent ID is already registered in our system. This may have occurred due to reusing an old ID from another partner or trying both test and live modes. Please try using a different unique ID.',
    '105': '**Message 105:** The IP address has been used multiple times. This may indicate suspicious behavior. Please try again using a different IP, switch to test mode, or use a new ID.',
    '106': '**Message 106:** Multiple IPs detected. The respondent\'s IP address changed during the survey, which may be flagged as manipulation. Ask the user to retry from a stable connection.',
    'partner quota': '**Partner Quota Achieved:** The specific quota set for a partner has been reached. Contact the Project Manager if additional slots are needed.',
    'daily quota': '**Daily Quota Achieved:** The maximum allowed number of responses for the day has been completed. The survey will be available again tomorrow or once limits are increased.',
    'defined quota': '**Defined Quota Achieved:** The quota defined in the client setup has been reached. You can either increase the quota or disable quota stop in your configuration.',
    'test link used': '**Test Link Limit Reached:** The number of allowed test link usages has been exhausted. Please increase the test limit via the PMT portal.',
    'out of test links': '**Out of Test Links:** No more test links are available for the project. Contact your Project Manager to increase the limit.',
    'invalid panel code': '**Invalid Panel Code:** The panel group (PG) in the survey link is invalid or not properly configured. Please check and correct the setup in the PMT portal.',
    'invalid country': '**Invalid Country Code:** The country code (CO) in the survey link is incorrect or not set up in the client configuration. Please verify the setup in the PMT portal.',
    'define quota': '**Please Define Quota:** Quota has not been defined in the client configuration. Please set up appropriate quota limits before running the survey.',
    'invalid link': '**Invalid Survey Link:** One or more required variables (PG, CO, trans_id) are missing or incorrect in the link. Ensure the link is correctly formatted before sending to users.',
    'survey paused': '**Survey Paused:** The survey is currently paused for this country or partner. To resume participation, unpause the configuration in either the client or panel setup.',
    'survey completed': '**Survey Already Completed or Terminated:** The same respondent ID has already completed or terminated the survey. Please use a new unique ID to retry.',
    '503 message': '"Thank you for your interest in our survey! We have already received the required responses for this moment.\n\nHowever, the study is still ongoing, and you may try again with the same link after an hour.\n\nWe appreciate your time and participation!"\n\n**Explanation:** Partner/hourly hits is achieved',
    'stress': 'Hey, take a deep breath! 😮‍💨 Survey building can be overwhelming, but you\'re doing great. Need a virtual coffee break? ☕',
    'help': 'I\'m like your personal survey superhero! 🦸‍♂️ I can help with projects, questions, templates, translations, and logic. What\'s bugging you?',
    'thanks': 'Aww, you\'re welcome! 😊 Making your day a bit easier is what I live for! Need anything else?',
    'bye': 'See you later! 👋 Don\'t work too hard, and remember - I\'m always here when you need me! 🤖',
    'hello': 'Hey there! 👋 Ready to conquer some surveys today? What can I help you with?',
    'hi': 'Hi! 😄 Another productive day ahead? Let\'s make this survey stuff easier together!',
    'good': 'That\'s the spirit! 🌟 Glad things are going well! Anything else I can help with?',
    'bad': 'Oh no! 😔 Having a rough day? Let me help make at least the survey part easier for you!',
    'yes': 'Great! 😄 I love the enthusiasm! What would you like to dive into?',
    'no': 'No worries! 😊 Sometimes we just need to chat. I\'m here whenever you need help!',
    'default': 'Hmm, that\'s a new one! 🤔 I\'m still learning, but I can definitely help with:\n\n• Creating projects\n• Adding questions\n• Using templates\n• Setting up translations\n• Configuring skip logic\n\nWhat sounds interesting to you?'
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = { type: 'user', text: inputText };
    const botResponse = getBotResponse(inputText);

    setMessages(prev => [...prev, userMessage, { type: 'bot', text: botResponse }]);
    setInputText('');
  };

  const getRandomGreeting = () => {
    return funnyGreetings[Math.floor(Math.random() * funnyGreetings.length)];
  };

  const getRandomMotivation = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  };

  const validateSurveyLink = (link) => {
    const errors = [];
    const fixes = [];
    
    // Check for missing ? before parameters
    if (link.includes('.asp&') && !link.includes('.asp?')) {
      errors.push('Missing "?" before parameters');
      fixes.push(link.replace('.asp&', '.asp?'));
    }
    
    // Check for spacing issues
    if (link.includes(' ')) {
      errors.push('Contains spaces in URL');
      fixes.push(link.replace(/\s+/g, ''));
    }
    
    // Check for placeholder variables that weren't replaced
    const placeholders = ['[panelcode]', '{CODE}', '(UID)', '[UID]', '{UID}', '(CODE)', '[CODE]', '{PANELCODE}', '(PANELCODE)'];
    placeholders.forEach(placeholder => {
      if (link.toLowerCase().includes(placeholder.toLowerCase())) {
        errors.push(`Placeholder "${placeholder}" not replaced with actual value`);
      }
    });
    
    // Check trans_id format
    const transIdMatch = link.match(/trans_id=([^&]+)/);
    if (transIdMatch) {
      const transId = transIdMatch[1];
      if (!transId.match(/^[A-Z]-\d{4}-[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-\d{2}$/)) {
        if (transId.includes('[') || transId.includes('{') || transId.includes('(')) {
          errors.push('trans_id contains placeholder instead of actual ID');
        } else {
          errors.push('trans_id format appears incorrect (should be like A-7348-72D6C738-77C9-45C5-13)');
        }
      }
    }
    
    return { errors, fixes };
  };

  const getBotResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Check if input looks like a survey link
    if (input.includes('globalresearchstudy.com') || input.includes('client_page.asp') || input.includes('pStart_Page.asp')) {
      const validation = validateSurveyLink(input);
      
      if (validation.errors.length > 0) {
        let response = '🔍 **Link Analysis - Issues Found:**\n\n';
        validation.errors.forEach((error, index) => {
          response += `${index + 1}. ${error}\n\n`;
        });
        
        if (validation.fixes.length > 0) {
          response += '\n**Suggested Fix:**\n\n' + validation.fixes[0];
        } else {
          response += '\n**Solution:** Please contact Xurway team for this error.';
        }
        
        return response;
      } else {
        return '✅ **Link looks good!** No obvious issues detected in the survey link.';
      }
    }
    
    // Stress/frustration detection
    if (lowerInput.includes('stress') || lowerInput.includes('difficult') || lowerInput.includes('hard') || lowerInput.includes('frustrated')) {
      return responses['stress'];
    }
    
    // Thanks detection
    if (lowerInput.includes('thank') || lowerInput.includes('thanks') || lowerInput.includes('appreciate')) {
      return responses['thanks'];
    }
    
    // Yes/No detection
    if (lowerInput === 'yes' || lowerInput === 'yeah' || lowerInput === 'yep') {
      return responses['yes'];
    }
    if (lowerInput === 'no' || lowerInput === 'nope' || lowerInput === 'nah') {
      return responses['no'];
    }
    
    // Greeting detection
    if (lowerInput.includes('hey') || lowerInput.includes('hello') || lowerInput.includes('hi ') || lowerInput === 'hi') {
      return responses['hello'];
    }
    
    // Help detection
    if (lowerInput.includes('help') || lowerInput.includes('assist') || lowerInput.includes('support')) {
      return responses['help'];
    }
    
    // Motivation request
    if (lowerInput.includes('motivate') || lowerInput.includes('encourage') || lowerInput.includes('inspire')) {
      return getRandomMotivation();
    }
    
    // Original keyword matching
    for (const [key, response] of Object.entries(responses)) {
      if (key !== 'default' && key !== 'stress' && key !== 'thanks' && key !== 'help' && lowerInput.includes(key)) {
        return response;
      }
    }
    
    // Topic-based responses
    if (lowerInput.includes('template')) return responses['how to use templates'];
    if (lowerInput.includes('question')) return responses['how to add questions'];
    if (lowerInput.includes('project') && !lowerInput.includes('link') && !lowerInput.includes('redirect')) return responses['how to create a project'];
    if (lowerInput.includes('translation') || lowerInput.includes('language')) return responses['how to set up translations'];
    if (lowerInput.includes('logic') || lowerInput.includes('skip')) return responses['how to configure skip logic'];
    
    // Specific error codes
    if (lowerInput === '503' || lowerInput === 'error 503') return responses['503'];
    if (lowerInput === '101' || lowerInput === 'message 101') return responses['101'];
    if (lowerInput === '102' || lowerInput === 'message 102') return responses['102'];
    if (lowerInput === '103' || lowerInput === 'message 103') return responses['103'];
    if (lowerInput === '105' || lowerInput === 'message 105') return responses['105'];
    if (lowerInput === '106' || lowerInput === 'message 106') return responses['106'];
    if (lowerInput.includes('503 message') || lowerInput.includes('503 thank you')) return responses['503 message'];
    if (lowerInput.includes('partner quota')) return responses['partner quota'];
    if (lowerInput.includes('daily quota')) return responses['daily quota'];
    if (lowerInput.includes('defined quota')) return responses['defined quota'];
    if (lowerInput.includes('test link used')) return responses['test link used'];
    if (lowerInput.includes('out of test links')) return responses['out of test links'];
    if (lowerInput.includes('invalid panel code')) return responses['invalid panel code'];
    if (lowerInput.includes('invalid country')) return responses['invalid country'];
    if (lowerInput.includes('define quota')) return responses['define quota'];
    if (lowerInput.includes('invalid link')) return responses['invalid link'];
    if (lowerInput.includes('survey paused')) return responses['survey paused'];
    if (lowerInput.includes('survey completed') || lowerInput.includes('already completed')) return responses['survey completed'];
    
    // All errors request
    if (lowerInput.includes('all error') || lowerInput.includes('all message') || lowerInput.includes('list error') || lowerInput.includes('show all error')) return responses['all errors'];
    
    // General error codes help
    if (lowerInput.includes('error') || lowerInput.includes('quota') || lowerInput.includes('invalid') || lowerInput.includes('message')) return responses['error codes'];
    if (lowerInput.includes('redirect') || lowerInput.includes('complete') || lowerInput.includes('terminate') || lowerInput.includes('overquota') || lowerInput.includes('quality')) return responses['redirect links'];
    if (lowerInput.includes('survey link') || lowerInput.includes('main link') || lowerInput.includes('test link') || lowerInput.includes('pstart') || lowerInput.includes('link format')) return responses['survey links'];
    
    // Enhanced keyword detection
    if (lowerInput.includes('503') || lowerInput.includes('overall hits') || lowerInput.includes('response quota')) return responses['503'];
    if (lowerInput.includes('101') || lowerInput.includes('102') || lowerInput.includes('103') || lowerInput.includes('id already') || lowerInput.includes('already registered')) return responses['102'];
    if (lowerInput.includes('105') || lowerInput.includes('ip multiple') || lowerInput.includes('multiple times')) return responses['105'];
    if (lowerInput.includes('106') || lowerInput.includes('ip changed') || lowerInput.includes('multiple ip')) return responses['106'];
    if (lowerInput.includes('partner quota') || lowerInput.includes('quota achieved')) return responses['partner quota'];
    if (lowerInput.includes('daily quota') || lowerInput.includes('day quota')) return responses['daily quota'];
    if (lowerInput.includes('test link') || lowerInput.includes('test limit')) return responses['test link used'];
    if (lowerInput.includes('panel code') || lowerInput.includes('invalid panel')) return responses['invalid panel code'];
    if (lowerInput.includes('country code') || lowerInput.includes('invalid country')) return responses['invalid country'];
    if (lowerInput.includes('paused') || lowerInput.includes('survey pause')) return responses['survey paused'];
    if (lowerInput.includes('completed') || lowerInput.includes('terminated') || lowerInput.includes('already done')) return responses['survey completed'];
    
    // Fallback with menu
    return responses.default + '\n\n**Quick Help:**\n• Type "all errors" for complete error list\n• Type error number (503, 101, etc.)\n• Type "survey links" for link formats\n• Type "redirect links" for redirect URLs';
  };

  // Initialize greeting when chatbot opens
  React.useEffect(() => {
    if (isOpen && !hasGreeted) {
      const greeting = getRandomGreeting();
      setMessages([{ type: 'bot', text: greeting }]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted]);

  // Handle global mouse events for dragging and resizing
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x)),
          y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragStart.y))
        });
      } else if (isResizing) {
        const deltaX = dragStart.x - e.clientX;
        const deltaY = e.clientY - dragStart.y;
        
        setSize({
          width: Math.max(300, size.width + deltaX),
          height: Math.max(400, size.height + deltaY)
        });
        
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, size]);

  const handleQuickReply = (reply) => {
    const botResponse = getBotResponse(reply);
    setMessages(prev => [...prev, 
      { type: 'user', text: reply },
      { type: 'bot', text: botResponse }
    ]);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--maverick-primary) 0%, var(--maverick-secondary) 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(83, 52, 131, 0.3)',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 20px rgba(83, 52, 131, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(83, 52, 131, 0.3)';
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: `${position.y}px`,
          right: `${position.x}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid #533483',
          borderRadius: '12px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          cursor: isDragging ? 'grabbing' : 'default',
          minWidth: '300px',
          minHeight: '400px',
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <div 
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--border-color)',
              background: 'linear-gradient(135deg, var(--maverick-primary) 0%, var(--maverick-secondary) 100%)',
              borderRadius: '12px 12px 0 0',
              cursor: 'grab',
              userSelect: 'none'
            }}
            onMouseDown={(e) => {
              setIsDragging(true);
              setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
              });
            }}
            onMouseMove={(e) => {
              if (isDragging) {
                setPosition({
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y
                });
              }
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  🤖
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
                    Maxi
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px' }}>
                    Online • Ready to help
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMessages([]);
                  setHasGreeted(false);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  padding: '4px 8px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: message.type === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: message.type === 'user' 
                    ? 'linear-gradient(135deg, var(--maverick-primary) 0%, var(--maverick-secondary) 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  {message.text}
                </div>
              </div>
            ))}

            {/* Quick Replies */}
            {messages.length === 1 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>
                  Quick questions:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(83, 52, 131, 0.2)',
                        border: '1px solid #533483',
                        borderRadius: '6px',
                        color: '#e0aaff',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(83, 52, 131, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(83, 52, 131, 0.2)';
                      }}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #533483',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your question..."
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                padding: '8px 12px',
                background: 'linear-gradient(135deg, var(--maverick-primary) 0%, var(--maverick-secondary) 100%)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Send
            </button>
          </div>
          
          {/* Resize Handle */}
          <div 
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: '20px',
              height: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              cursor: 'nw-resize',
              borderRadius: '0 12px 0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.5)'
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              setDragStart({ x: e.clientX, y: e.clientY });
            }}
          >
            ⤢
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;