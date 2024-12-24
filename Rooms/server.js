const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

mongoose.connect('', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const reservationSchema = new mongoose.Schema({
  name: String,
  date: String,
  day: String,
  time: String
});

const Reservation = mongoose.model('Reservation', reservationSchema);

app.get('/reservations', async (req, res) => {
  const reservations = await Reservation.find();
  res.json(reservations);
});

app.post('/reservations', async (req, res) => {
  const newReservation = new Reservation(req.body);
  await newReservation.save();
  res.status(201).json({ message: '예약 성공!' });
});

app.delete('/reservations/:id', async (req, res) => {
  await Reservation.findByIdAndDelete(req.params.id);
  res.json({ message: '삭제 성공!' });
});

app.put('/reservations/:id', async (req, res) => {
  await Reservation.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: '수정 성공!' });
});

app.listen(PORT, () => console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`));
