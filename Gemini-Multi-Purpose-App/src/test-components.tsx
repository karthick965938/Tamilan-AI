import React from 'react';
import { OutputDisplay, GridDisplay, AnnotatedImageDisplay, ComicStripDisplay, StoryboardDisplay, MoodboardDisplay } from './components/OutputDisplay';
import { GenerationResult } from './types';

// Test component to verify all output display components are working
const TestComponents: React.FC = () => {
  const mockResult: GenerationResult = {
    success: true,
    imageUrl: 'https://via.placeholder.com/400x300',
    imageUrls: [
      'https://via.placeholder.com/200x200/ff0000',
      'https://via.placeholder.com/200x200/00ff00',
      'https://via.placeholder.com/200x200/0000ff'
    ],
    metadata: {
      functionType: 'test',
      processingTime: 1500,
      timestamp: new Date(),
      inputImageCount: 1
    },
    annotations: [
      {
        id: '1',
        x: 10,
        y: 10,
        width: 50,
        height: 50,
        foodName: 'Apple',
        calories: 95,
        confidence: 0.95
      }
    ]
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Output Display Components Test</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>OutputDisplay</h2>
        <OutputDisplay result={mockResult} />
      </section>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>GridDisplay</h2>
        <GridDisplay result={mockResult} />
      </section>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>AnnotatedImageDisplay</h2>
        <AnnotatedImageDisplay result={mockResult} />
      </section>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>ComicStripDisplay</h2>
        <ComicStripDisplay result={mockResult} />
      </section>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>StoryboardDisplay</h2>
        <StoryboardDisplay result={mockResult} />
      </section>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>MoodboardDisplay</h2>
        <MoodboardDisplay result={mockResult} />
      </section>
    </div>
  );
};

export default TestComponents;