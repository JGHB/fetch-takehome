import React from "react";
import styles from "./DogProfileCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as fasHeart } from "@fortawesome/free-solid-svg-icons";

interface DogProfileProps {
  dog: Dog;
  selected?: boolean;
  onSelectChange?: (dogId: string, selected: boolean) => void;
}

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

const DogProfileCard: React.FC<DogProfileProps> = ({
  dog,
  selected,
  onSelectChange,
}) => {
  return (
    <div key={dog.id} className={styles.container}>
      <img src={dog.img} alt={dog.name} />
      <h3 className={styles.name}>{dog.name}</h3>
      <p className={styles.profileText}>Breed: {dog.breed}</p>
      <p className={styles.profileText}>
        Age: {dog.age > 0 ? dog.age : "Puppy"}
      </p>
      {!!onSelectChange && (
        <button onClick={(e) => onSelectChange(dog.id, !selected)}>
          <FontAwesomeIcon icon={selected ? fasHeart : farHeart} />
        </button>
      )}
    </div>
  );
};

export default DogProfileCard;
