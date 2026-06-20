const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Remove interface LoveMessage
content = content.replace(/interface LoveMessage \{[\s\S]*?\}\n/g, '');

// Remove messagesCount from AdminMetrics
content = content.replace(/  messagesCount: number;\n/g, '');

// Remove state messages
content = content.replace(/  const \[messages, setMessages\] = useState<LoveMessage\[\]>\(\[\]\);\n/g, '');

// Remove sender, text, emoji, bubbleColor states
content = content.replace(/  const \[sender, setSender\] = useState<string>\(''\);\n  const \[text, setText\] = useState<string>\(''\);\n  const \[emoji, setEmoji\] = useState<string>\('⭐'\);\n  const \[bubbleColor, setBubbleColor\] = useState<string>\('from-emerald-500\/15 over-teal-500\/10 text-emerald-600 dark:text-emerald-400 border-emerald-200\/50'\);\n/g, '');

// Remove handleDeleteMessage to handleReseedMessages
content = content.replace(/  \/\/ 1\. Delete message endpoint trigger[\s\S]*?setIsLoading\(false\);\n    }\n  };\n/g, '');

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log('Cleaned messages logic from AdminDashboard.tsx');
