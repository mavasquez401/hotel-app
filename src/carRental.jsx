import { useState } from 'react'
import './App.css'

const cars = [
  { make: 'Toyota', model: 'Camry', year: 2021, dailyRate: 80, available: true },
  { make: 'Honda', model: 'Civic', year: 2020, dailyRate: 70, available: true },
  { make: 'Ford', model: 'Mustang', year: 2022, dailyRate: 100, available: true },
  { make: 'Chevrolet', model: 'Malibu', year: 2019, dailyRate: 60, available: false },
  { make: 'Nissan', model: 'Altima', year: 2023, dailyRate: 85, available: false }
];

const CarDropdown = () => {
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDays, setSelectedDays] = useState('');

  const availableCars = cars.filter(car => car.available);

  const makes = [...new Set(availableCars.map(car => car.make))];
  const models = selectedMake ? [...new Set(availableCars.filter(car => car.make === selectedMake).map(car => car.model))] : [];
  const years = selectedModel ? [...new Set(availableCars.filter(car => car.model === selectedModel).map(car => car.year))] : [];

  const selectedCar = availableCars.find(car =>
    car.make === selectedMake &&
    car.model === selectedModel &&
    car.year.toString() === selectedYear
  );

  const handleMakeChange = (e) => {
    setSelectedMake(e.target.value);
    setSelectedModel('');
    setSelectedYear('');
    setSelectedDays('');
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setSelectedYear('');
    setSelectedDays('');
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setSelectedDays('');
  };

  const resetSelections = () => {
    setSelectedMake('');
    setSelectedModel('');
    setSelectedYear('');
    setSelectedDays('');
  };

  return (
    <div>
      <h1>DevAccelerator Hotel Rental</h1>
      <label htmlFor="makeSelect">Choose a make:</label>
      <select id="makeSelect" value={selectedMake} onChange={handleMakeChange}>
        <option value="" disabled>Select a make</option>
        {makes.map((make, index) => (
          <option key={index} value={make}>{make}</option>
        ))}
      </select>

      <label htmlFor="modelSelect">Choose a model:</label>
      <select id="modelSelect" value={selectedModel} onChange={handleModelChange} disabled={!selectedMake}>
        <option value="" disabled>Select a model</option>
        {models.map((model, index) => (
          <option key={index} value={model}>{model}</option>
        ))}
      </select>

      <label htmlFor="yearSelect">Choose a year:</label>
      <select id="yearSelect" value={selectedYear} onChange={handleYearChange} disabled={!selectedModel}>
        <option value="" disabled>Select a year</option>
        {years.map((year, index) => (
          <option key={index} value={year}>{year}</option>
        ))}
      </select>

      <label htmlFor="daysSelect">Number of days (1-90):</label>
      <select id="daysSelect" value={selectedDays} onChange={e => setSelectedDays(e.target.value)} disabled={!selectedYear}>
        <option value="" disabled>Select days</option>
        {[...Array(90).keys()].map(day => (
          <option key={day + 1} value={day + 1}>{day + 1}</option>
        ))}
      </select>

      {selectedMake && selectedModel && selectedYear && selectedDays && (
        <div>
          <p>
            You selected: {selectedMake} {selectedModel} {selectedYear} for {selectedDays} days
          </p>
          {selectedCar ? (
            <div>
              <p>Daily Rate: ${selectedCar.dailyRate}</p>
              <p>Total Cost: ${selectedCar.dailyRate * selectedDays}</p>
              <button onClick={() => alert(`Renting ${selectedMake} ${selectedModel} ${selectedYear} for ${selectedDays} days`)}>
                Rent Now
              </button>
            </div>
          ) : (
            <p>This car is not available for rent.</p>
          )}
        </div>
      )}

      <button onClick={resetSelections}>Reset</button>
    </div>
  );
};


export default CarDropdown;