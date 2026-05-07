import React from 'react';
import ForecastComponent from '../components/Forecast/Forecast';

const Forecast = ({ activeSubSection, setActiveSubSection }) => {
    return (
        <div className="forecast-page">
            <ForecastComponent 
                activeSubSection={activeSubSection}
                setActiveSubSection={setActiveSubSection}
            />
        </div>
    );
};

export default Forecast;
