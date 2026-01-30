import React, { useState } from 'react';
import { Sidebar, ViewType } from './components/Sidebar';
import { Home } from './components/Home';
import { Editor } from './components/Editor';
import { ImageGenerator } from './components/ImageGenerator';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { ViralCopycat } from './components/ViralCopycat';
import { Template } from './types';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleNavigate = (view: ViewType) => {
    setActiveView(view);
    if (view === 'home') {
      setSelectedTemplate(null);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setActiveView('editor');
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Home onSelectTemplate={handleSelectTemplate} />;
      case 'editor':
        return <Editor initialTemplate={selectedTemplate} onBack={() => handleNavigate('home')} />;
      case 'viral-copy':
        return <ViralCopycat />;
      case 'image-gen':
        return <ImageGenerator />;
      case 'calendar':
        return <CalendarView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Home onSelectTemplate={handleSelectTemplate} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <Sidebar activeView={activeView} onNavigate={handleNavigate} />
      {renderView()}
      
      {/* Preload fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    </div>
  );
}

export default App;