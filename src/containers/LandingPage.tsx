import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Dog {
  id: string
  img: string
  name: string
  age: number
  zip_code: string
  breed: string
}

interface Location {
  zip_code: string
  latitude: number
  longitude: number
  city: string
  state: string
  county: string
}

const LandingPage: React.FC = () => {
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [paginatedDogs, setPaginatedDogs] = useState<Dog[]>([]);
    const [selectedDogs, setSelectedDogs] = useState<string[]>([])
    const [matchDog, setMatchDog] = useState<Dog | null>(null)
    const [breeds, setBreeds] = useState<string[]>([]);
    const [allBreeds, setAllBreeds] = useState<string[]>([]);
    const [minAge, setMinAge] = useState<number | null>(null);
    const [maxAge, setMaxAge] = useState<number | null>(null);
    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10); // Default value, you can change it
    const [totalPages, setTotalPages] = useState<number>(0);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [prevPage, setPrevPage] = useState<string | null>(null);
    const [inputPerPage, setInputPerPage] = useState<number>(10); // Default value, you can change it
    const sortOptions = [
        { value: "breed:asc", label: "Breed A-Z" }, 
        { value: "breed:desc", label: "Breed Z-A" }, 
        { value: "age:asc", label: "Age Low-High" }, 
        { value: "age:desc", label: "Age High-Low" }
      ];
    const [sort, setSort] = useState<string>(sortOptions[0].value);
    const navigate = useNavigate();

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await axios.get<string[]>('https://frontend-take-home-service.fetch.com/dogs/breeds', { withCredentials: true });

        if (response.status === 200) {
          setAllBreeds(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch breeds:', error);
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
      const response = await axios.post('https://frontend-take-home-service.fetch.com/auth/logout', {}, { withCredentials: true });

      if (response.status === 200) {
        navigate("/");
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleSearch = async () => {

    setPerPage(inputPerPage);

    try {
      const response = await axios.get('https://frontend-take-home-service.fetch.com/dogs/search', {
        params: {
          breeds,
          ageMin: minAge,
          ageMax: maxAge,
          size: inputPerPage,
          sort: sort
        },
        withCredentials: true
      });

      if (response.status === 200) {
        const { resultIds, next, prev } = response.data;
        const dogsResponse = await axios.post<Dog[]>('https://frontend-take-home-service.fetch.com/dogs', resultIds, { withCredentials: true });

        if (dogsResponse.status === 200) {
          setDogs(dogsResponse.data);
          setNextPage(next)
          setPrevPage(prev)
        }
      }
    } catch (error) {
      console.error('Failed to search dogs:', error);
    }
  };

  const handlePageChange = async (direction: string) => {
    try {
      const page = direction === 'next' ? nextPage : prevPage;

      if (page) {
        const response = await axios.get(`https://frontend-take-home-service.fetch.com${page}`, { withCredentials: true });

        if (response.status === 200) {
          const { resultIds, next, prev } = response.data;
          const dogsResponse = await axios.post<Dog[]>('https://frontend-take-home-service.fetch.com/dogs', resultIds, { withCredentials: true });

          if (dogsResponse.status === 200) {
            setDogs(dogsResponse.data);
            setNextPage(next);
            setPrevPage(prev);
          }
        }
      }
    } catch (error) {
      console.error('Failed to navigate to the page:', error);
    }
  };

  const handleGetDogMatch = async () => {
    try{
        const response = await axios.post<{match: string}>('https://frontend-take-home-service.fetch.com/dogs/match', selectedDogs, { withCredentials: true });
        if (response.status === 200) {
            const matchId = response.data.match;
            const matchResponse = await axios.post<Dog[]>('https://frontend-take-home-service.fetch.com/dogs', [matchId], { withCredentials: true });

            if (matchResponse.status === 200) {
              setMatchDog(matchResponse.data[0]);
              console.log(matchDog)
            }
        }
    } catch (error) {
        console.log('Failed to get match')
    }
  };

  const handleBreedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = event.target;

    if (checked) {
      setBreeds([...breeds, value]);
    } else {
      setBreeds(breeds.filter(breed => breed !== value));
    }
  };

  const handleSelectedDogChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = event.target;

    if (checked) {
      setSelectedDogs([...selectedDogs, value]);
    } else {
      setSelectedDogs(selectedDogs.filter(dog => dog !== value));
    }
  };


  // Display dogs' data
  return (
    <div>
      <h1>Welcome!</h1>
      <button onClick={handleLogout}>Logout</button>
      {!matchDog && (
      <div>
        <h2>Search for dogs:</h2>
      <div>
        <p>Breeds:</p>
        {allBreeds.map(breed => (
          <label key={breed}>
            <input type="checkbox" value={breed} checked={breeds.includes(breed)} onChange={handleBreedChange} />
            {breed}
          </label>
        ))}
        <label>
          Min Age:
          <input type="number" value={minAge || ''} onChange={e => setMinAge(e.target.value ? parseInt(e.target.value, 10) : null)} />
        </label>
        <label>
          Max Age:
          <input type="number" value={maxAge || ''} onChange={e => setMaxAge(e.target.value ? parseInt(e.target.value, 10) : null)} />
        </label>
        <label>
        Sort By:
        <select value={sort} onChange={e => setSort(e.target.value)}>
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleGetDogMatch}>Find Match</button>
      </div>
      <h2>Here are some dogs for you:</h2>
      <div>
        Items per page: 
        <input type="number" value={inputPerPage} onChange={handlePerPageChange} />
      </div>
      <div>
        {dogs.map(dog => (
          <div key={dog.id}>
            <img src={dog.img} alt={dog.name} />
            <h3>{dog.name}</h3>
            <p>{dog.breed}</p>
            <p>{dog.age}</p>
            <p>{dog.zip_code}</p>
            <input type="checkbox" value={dog.id} checked={selectedDogs.includes(dog.id)} onChange={handleSelectedDogChange} />
          </div>
        ))}
      </div>
      <div>
        <button onClick={()=> console.log(nextPage)}>TEST3</button>
        <button disabled={!prevPage} onClick={() => handlePageChange('prev')}>Previous</button>
        <button disabled={!nextPage} onClick={() => handlePageChange('next')}>Next</button>
      </div>
      </div>
      )}
      {matchDog && (
        <div>
            <img src={matchDog.img} alt={matchDog.name} />
            <h3>{matchDog.name}</h3>
            <p>{matchDog.breed}</p>
            <p>{matchDog.age}</p>
            <p>{matchDog.zip_code}</p>
        </div>
      )}
      
    </div>
  );
}

export default LandingPage;

