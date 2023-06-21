import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import styles from "./LandingPage.module.css";
import DogProfileCard from "../../components/DogProfileCard/DogProfileCard";

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

const LandingPage: React.FC = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [paginatedDogs, setPaginatedDogs] = useState<Dog[]>([]);
  const [selectedDogs, setSelectedDogs] = useState<string[]>([]);
  const [matchDog, setMatchDog] = useState<Dog | null>(null);
  const [breeds, setBreeds] = useState<string[]>([]);
  const [allBreeds, setAllBreeds] = useState<string[]>([]);
  const [minAge, setMinAge] = useState<number | null>(null);
  const [maxAge, setMaxAge] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [inputPerPage, setInputPerPage] = useState<number>(10);
  const sortOptions = [
    { value: "breed:asc", label: "Breed A-Z" },
    { value: "breed:desc", label: "Breed Z-A" },
    { value: "age:asc", label: "Age Low-High" },
    { value: "age:desc", label: "Age High-Low" },
  ];
  const [sort, setSort] = useState<string>(sortOptions[0].value);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await axios.get<string[]>(
          "https://frontend-take-home-service.fetch.com/dogs/breeds",
          { withCredentials: true }
        );

        if (response.status === 200) {
          setAllBreeds(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch breeds:", error);
      }
    };

    fetchBreeds();
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(dogs.length / perPage);
    setTotalPages(totalPages);

    const startIndex = (page - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, dogs.length);
    setPaginatedDogs(dogs.slice(startIndex, endIndex));
  }, [dogs, page, perPage]);

  const handlePerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputPerPage(Number(event.target.value));
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "https://frontend-take-home-service.fetch.com/auth/logout",
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const handleSearch = async () => {
    setPerPage(inputPerPage);

    try {
      const response = await axios.get(
        "https://frontend-take-home-service.fetch.com/dogs/search",
        {
          params: {
            breeds,
            ageMin: minAge,
            ageMax: maxAge,
            size: inputPerPage,
            sort: sort,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const { resultIds, next, prev } = response.data;
        const dogsResponse = await axios.post<Dog[]>(
          "https://frontend-take-home-service.fetch.com/dogs",
          resultIds,
          { withCredentials: true }
        );

        if (dogsResponse.status === 200) {
          setDogs(dogsResponse.data);
          setNextPage(next);
          setPrevPage(prev);
        }
      }
    } catch (error) {
      console.error("Failed to search dogs:", error);
    }
  };

  const handlePageChange = async (direction: string) => {
    try {
      const page = direction === "next" ? nextPage : prevPage;

      if (page) {
        const response = await axios.get(
          `https://frontend-take-home-service.fetch.com${page}`,
          { withCredentials: true }
        );

        if (response.status === 200) {
          const { resultIds, next, prev } = response.data;
          const dogsResponse = await axios.post<Dog[]>(
            "https://frontend-take-home-service.fetch.com/dogs",
            resultIds,
            { withCredentials: true }
          );

          if (dogsResponse.status === 200) {
            setDogs(dogsResponse.data);
            setNextPage(next);
            setPrevPage(prev);
          }
        }
      }
    } catch (error) {
      console.error("Failed to navigate to the page:", error);
    }
  };

  const handleGetDogMatch = async () => {
    try {
      const response = await axios.post<{ match: string }>(
        "https://frontend-take-home-service.fetch.com/dogs/match",
        selectedDogs,
        { withCredentials: true }
      );
      if (response.status === 200) {
        const matchId = response.data.match;
        const matchResponse = await axios.post<Dog[]>(
          "https://frontend-take-home-service.fetch.com/dogs",
          [matchId],
          { withCredentials: true }
        );

        if (matchResponse.status === 200) {
          setMatchDog(matchResponse.data[0]);
        }
      }
    } catch (error) {
      console.log("Failed to get match");
    }
  };

  const handleBreedChange = (selectedOptions: any) => {
    const values = selectedOptions
      ? selectedOptions.map((option: { value: string }) => option.value)
      : [];

    setBreeds(values);
  };

  const handleSelectedDogChange = (dogId: string, selected: boolean) => {
    if (selected) {
      setSelectedDogs([...selectedDogs, dogId]);
    } else {
      setSelectedDogs(selectedDogs.filter((dog) => dog !== dogId));
    }
  };

  return (
    <div>
      {!matchDog && (
        <div>
          <div className={styles.searchHeader}>
            <h2 className={styles.instructions}>Search for Dogs</h2>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
          <div className={styles.inputsContainer}>
            <div className={styles.breedWrapper}>
              <p className={styles.inputText}>Breeds:</p>
              <Select
                isMulti
                options={allBreeds.map((breed) => ({
                  value: breed,
                  label: breed,
                }))}
                value={breeds.map((breed) => ({ value: breed, label: breed }))}
                onChange={handleBreedChange}
                styles={{
                  container: (provided) => ({
                    ...provided,
                    width: "100%",
                  }),
                }}
              />
            </div>
            <div>
              <div className={styles.inputWrapper}>
                <label className={styles.inputText}>
                  Min Age:
                  <input
                    type="number"
                    value={minAge || ""}
                    onChange={(e) =>
                      setMinAge(
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    className={styles.inputField}
                  />
                </label>
              </div>
              <div className={styles.inputWrapper}>
                <label className={styles.inputText}>
                  Max Age:
                  <input
                    type="number"
                    value={maxAge || ""}
                    onChange={(e) =>
                      setMaxAge(
                        e.target.value ? parseInt(e.target.value, 10) : null
                      )
                    }
                    className={styles.inputField}
                  />
                </label>
              </div>
            </div>
            <div>
              <div className={styles.inputWrapper}>
                <label className={styles.inputText}>
                  Sort By:
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className={styles.inputField}
                    style={{ paddingRight: "0px" }}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className={styles.inputWrapper}>
                <label className={styles.inputText}>
                  Results per Page:
                  <input
                    type="number"
                    value={inputPerPage}
                    onChange={handlePerPageChange}
                    className={styles.inputField}
                  />
                </label>
              </div>
            </div>
            <button onClick={handleSearch} className={styles.actionButton}>
              Search
            </button>
            <button onClick={handleGetDogMatch} className={styles.actionButton}>
              Find Match
            </button>
          </div>
          {dogs.length > 0 && (
            <h2 className={styles.instructions}>Here are some dogs for you:</h2>
          )}
          <div className={styles.dogContainer}>
            {dogs.map((dog) => (
              <DogProfileCard
                key={dog.id}
                dog={dog}
                selected={selectedDogs.includes(dog.id)}
                onSelectChange={handleSelectedDogChange}
              />
            ))}
          </div>
          {dogs.length > 0 && (
            <div className={styles.paginationContainer}>
              {prevPage && (
                <button
                  onClick={() => handlePageChange("prev")}
                  className={styles.paginationButton}
                >
                  {"<"}
                </button>
              )}
              {nextPage && (
                <button
                  onClick={() => handlePageChange("next")}
                  className={styles.paginationButton}
                >
                  {">"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {matchDog && (
        <div className={styles.matchContainer}>
          <h2 className={styles.instructions}>Your Match</h2>
          <DogProfileCard key={matchDog.id} dog={matchDog} />
          <button
            onClick={() => {
              setDogs([]);
              setSelectedDogs([]);
              setMatchDog(null);
            }}
            className={styles.actionButton}
          >
            Search Again
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
