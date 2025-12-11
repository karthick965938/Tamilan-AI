import React from 'react';
import { FunctionalityConfig } from '../../types';
import { 
  HairstyleChanger,
  OOTDGenerator,
  ClothingChanger,
  ExplosiveFoodGenerator,
  FashionMoodboard,
  ProductPackaging,
  CalorieAnnotator,
  IDPhotoCreator,
  ComicBookCreator,
  MovieStoryboard
} from '../functionalities';
import './FunctionalityContainer.css';

interface FunctionalityContainerProps {
  functionality: FunctionalityConfig;
}

// Component mapping for functionality IDs
const getFunctionalityComponent = (functionalityId: string) => {
  const componentMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'hairstyle-changer': HairstyleChanger,
    'ootd-generator': OOTDGenerator,
    'clothing-changer': ClothingChanger,
    'explosive-food': ExplosiveFoodGenerator,
    'fashion-moodboard': FashionMoodboard,
    'product-packaging': ProductPackaging,
    'calorie-annotator': CalorieAnnotator,
    'id-photo-creator': IDPhotoCreator,
    'comic-book-creator': ComicBookCreator,
    'movie-storyboard': MovieStoryboard
  };

  return componentMap[functionalityId];
};

export const FunctionalityContainer: React.FC<FunctionalityContainerProps> = ({
  functionality
}) => {
  const FunctionalityComponent = getFunctionalityComponent(functionality.id);

  if (!FunctionalityComponent) {
    return (
      <div className="functionality-container">
        <div className="functionality-error">
          <h3>Component Not Found</h3>
          <p>The functionality component for "{functionality.name}" is not available.</p>
          <p>Functionality ID: {functionality.id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="functionality-container">
      <FunctionalityComponent className="functionality-component" />
    </div>
  );
};