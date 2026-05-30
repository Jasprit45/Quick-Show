import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movie from './pages/Movie'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBooking from './pages/MyBooking'
import Favorite from './pages/Favorite'
import Navbar from './components/Navbar'
import {Toaster} from 'react-hot-toast'
import Footer from './components/Footer'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBooking from './pages/admin/ListBooking'

const App = () => {

  const isAdminRoutes = useLocation().pathname.startsWith('/admin');
  return (
    <>
    <Toaster />
    {!isAdminRoutes && <Navbar/>}
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/movies' element={<Movie/>} />
      <Route path='/movies/:id' element={<MovieDetails/>} />
      <Route path='/movies/:id/:date' element={<SeatLayout/>} />
      <Route path='/my-bookings' element={<MyBooking/>} />
      <Route path='/favorites' element={<Favorite/>} />
      <Route path='/admin/*' element={<Layout/>}>
        <Route  index element={<Dashboard/>} />
        <Route path='add-shows' index element={<AddShows/>} />
        <Route path='list-shows' index element={<ListShows/>} />
        <Route path='list-bookings' index element={<ListBooking/>} />
      </Route>
    </Routes>
    {!isAdminRoutes && <Footer/>}
    </>
  )
}

export default App