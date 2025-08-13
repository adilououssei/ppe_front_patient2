import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import Step1SelectDoctor from './Step1SelectDoctor';
import Step2SelectTime from './Step2SelectTime';
import Step3Confirmation from './Step3Confirmation';

const PriseRendezVous = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState({
    doctor: null,
    consultationType: '',
    date: null,
    time: null,
    symptoms: '',
  });

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const updateData = (newData) => {
    setAppointmentData({ ...appointmentData, ...newData });
  };

  const steps = [
    <Step1SelectDoctor 
      nextStep={nextStep} 
      updateData={updateData} 
      initialData={appointmentData}
    />,
    <Step2SelectTime 
      nextStep={nextStep} 
      prevStep={prevStep} 
      updateData={updateData} 
      initialData={appointmentData}
    />,
    <Step3Confirmation 
      prevStep={prevStep} 
      data={appointmentData}
      onSubmit={() => console.log('Rendez-vous confirmé', appointmentData)}
    />
  ];

  return (
    <Container className="my-5">
      <h2 className="mb-4">Prendre un rendez-vous</h2>
      {steps[currentStep - 1]}
    </Container>
  );
};

export default PriseRendezVous;