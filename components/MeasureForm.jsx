import './MeasureForm.css';
import { useState } from "react";

const MeasureForm = () => {
  // Состояние для хранения данных формы
  const [measurements, setMeasurements] = useState({
    waist: "",
    hips: "",
    chest: "",
    height: "",
  });

  // Состояние для ошибок
  const [errors, setErrors] = useState({
    waist: "",
    hips: "",
    chest: "",
    height: "",
  });

  // Функция для обновления значений в состоянии
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeasurements((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Функция для проверки валидности
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Проверяем каждое поле
    for (const [key, value] of Object.entries(measurements)) {
      if (!value || isNaN(value) || value <= 0) {
        newErrors[key] = "Please enter a valid value";
        isValid = false;
      } else {
        newErrors[key] = "";
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Функция для обработки отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Пример отправки данных на сервер (или другой логики)
      alert("Measurements successfully submitted!");
      // Здесь можно перенаправить на страницу оплаты
    }
  };

  return (
    <div>
      <h2>Enter your measurements</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Waist (cm):</label>
          <input
            type="number"
            name="waist"
            value={measurements.waist}
            onChange={handleChange}
          />
          {errors.waist && <p style={{ color: "red" }}>{errors.waist}</p>}
        </div>
        <div>
          <label>Hip circumference (cm):</label>
          <input
            type="number"
            name="hips"
            value={measurements.hips}
            onChange={handleChange}
          />
          {errors.hips && <p style={{ color: "red" }}>{errors.hips}</p>}
        </div>
        <div>
          <label>Bust circumference (cm):</label>
          <input
            type="number"
            name="chest"
            value={measurements.chest}
            onChange={handleChange}
          />
          {errors.chest && <p style={{ color: "red" }}>{errors.chest}</p>}
        </div>
        <div>
          <label>Height (cm):</label>
          <input
            type="number"
            name="height"
            value={measurements.height}
            onChange={handleChange}
          />
          {errors.height && <p style={{ color: "red" }}>{errors.height}</p>}
        </div>
        <button type="submit">Submit data</button>
      </form>
    </div>
  );
};

export default MeasureForm;
