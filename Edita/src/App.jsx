import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './App.css';

function App() {
  const [files, setFiles] = useState([
    { id: 1, name: 'index.html', language: 'html', content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <h1>Welcome to My Web App! 🚀</h1>
        <p>Built with Edita - Prime Executive Tech™️</p>
        <button onclick="sayHello()">Click Me!</button>
    </div>
    <script src="script.js"></script>
</body>
</html>` },
    { id: 2, name: 'style.css', language: 'css', content: `body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

#app {
    background: white;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    text-align: center;
    max-width: 500px;
}

h1 {
    color: #2d3436;
    margin-bottom: 20px;
}

p {
    color: #636e72;
    margin-bottom: 30px;
}

button {
    background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.3s;
}

button:hover {
    transform: translateY(-3px);
}` },
    { id: 3, name: 'script.js', language: 'javascript', content: `function sayHello() {
    alert('Hello from Edita! 🎉\\n\\nBuilt with Prime Executive Tech™️');
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Web app loaded successfully!');
    
    // Add click animation to button
    const button = document.querySelector('button');
    button.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});` }
  ]);
  
  const [activeFileId, setActiveFileId] = useState(1);
  const [theme, setTheme] = useState('vs-dark');
  const editorRef = useRef(null);

  const activeFile = files.find(file => file.id === activeFileId);

  const handleEditorChange = (value) => {
    setFiles(files.map(file => 
      file.id === activeFileId ? { ...file, content: value } : file
    ));
  };

  const createNewFile = () => {
    const name = prompt('Enter file name (with extension):');
    if (name) {
      const extension = name.split('.').pop().toLowerCase();
      let language = 'plaintext';
      let content = '';
      
      switch (extension) {
        case 'html':
          language = 'html';
          content = '<!DOCTYPE html>\\n<html>\\n<head>\\n    <title>New Page</title>\\n</head>\\n<body>\\n    \\n</body>\\n</html>';
          break;
        case 'css':
          language = 'css';
          content = '/* New stylesheet */\\nbody {\\n    margin: 0;\\n    padding: 0;\\n}';
          break;
        case 'js':
          language = 'javascript';
          content = '// New JavaScript file\\nconsole.log("Hello from new file!");';
          break;
        case 'json':
          language = 'json';
          content = '{\\n    "name": "new-file",\\n    "version": "1.0.0"\\n}';
          break;
      }
      
      const newFile = {
        id: Date.now(),
        name,
        language,
        content
      };
      
      setFiles([...files, newFile]);
      setActiveFileId(newFile.id);
    }
  };

  const deleteFile = (fileId) => {
    if (files.length > 1) {
      setFiles(files.filter(file => file.id !== fileId));
      if (activeFileId === fileId) {
        setActiveFileId(files[0].id);
      }
    }
  };

  const downloadFile = (file) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewCode = () => {
    const htmlFile = files.find(f => f.name.endsWith('.html'));
    if (htmlFile) {
      const newWindow = window.open();
      newWindow.document.write(htmlFile.content);
      newWindow.document.close();
    } else {
      alert('No HTML file found for preview!');
    }
  };

  return (
    <div className="App">
      <header className="editor-header">
        <h1>📝 Edita Editor</h1>
        <p>Prime Executive Tech™️ - Code with Style</p>
        <div className="header-controls">
          <button onClick={createNewFile} className="new-file-btn">➕ New File</button>
          <button onClick={previewCode} className="preview-btn">👁️ Preview</button>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            className="theme-selector"
          >
            <option value="vs-dark">🌙 Dark</option>
            <option value="light">☀️ Light</option>
            <option value="hc-black">🔳 High Contrast</option>
          </select>
        </div>
      </header>
      
      <div className="editor-container">
        <div className="file-tabs">
          {files.map(file => (
            <div 
              key={file.id}
              className={`file-tab ${file.id === activeFileId ? 'active' : ''}`}
              onClick={() => setActiveFileId(file.id)}
            >
              <span className="file-icon">
                {file.language === 'html' ? '🌐' : 
                 file.language === 'css' ? '🎨' : 
                 file.language === 'javascript' ? '⚡' : '📄'}
              </span>
              <span className="file-name">{file.name}</span>
              {files.length > 1 && (
                <button 
                  className="close-tab"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                >
                  ✕
                </button>
              )}
              <button 
                className="download-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFile(file);
                }}
                title="Download file"
              >
                💾
              </button>
            </div>
          ))}
        </div>
        
        <div className="editor-wrapper">
          <Editor
            height="100%"
            language={activeFile?.language}
            value={activeFile?.content}
            theme={theme}
            onChange={handleEditorChange}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              formatOnPaste: true,
              formatOnType: true
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;