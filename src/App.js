import React, { Component } from 'react';
import './App.css';
// import '../node_modules/flexboxgrid/css/flexboxgrid.min.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.changeMonth = this.changeMonth.bind(this)
    this.state = {
      date: new Date()
    }
  }

  changeMonth(direction){
    let curDate = new Date(this.state.date.getFullYear(), this.state.date.getMonth(), 1)
    if(direction === "backwards"){this.setState({date: new Date(curDate.setMonth(curDate.getMonth()-1))})}
    if(direction === "forwards"){this.setState({date: new Date(curDate.setMonth(curDate.getMonth()+1))})}
  }

  render() {
    const year = this.state.date.getFullYear()
    const month = this.state.date.getMonth()
    const day = this.state.date.getDate()
    return (
      <div className="app">
        {banner}
        <DisplayMonth
          monthName={getMonthName(new Date(year, month, day))}
          year={year}
          month={month}
          changeMonth={this.changeMonth}/>
        <Calendar calendarHeader = {calendarHeader}
          year = {year}
          month = {month}
          dateMatrix = {getMonthDates(year, month)}/>
      </div>

    )
  }
}

// Date  => Str
const getMonthName = (date = new Date(), locale = "en-us") => date.toLocaleString(locale, { month: "long" })

// Int, Int => 6x7 Array
const getMonthDates = (year = new Date().getFullYear(), month = new Date().getMonth()) =>{
  let firstWeekdayNumber = new Date(year, month, 1).getDay()
  let nullArr = new Array(42).fill(null)
  let dateArr = nullArr.map(
    (val, index)=> new Date(year, month, index - firstWeekdayNumber + 1)
  )
  let dateMatrix = dateArr.reduce((a, c, i) => {                                // https://stackoverflow.com/questions/44937470/turning-an-array-into-a-multidimensional-array-javascript
    return i % 7 === 0 ? a.concat([dateArr.slice(i, i + 7)]) : a;
  }, [])
  return dateMatrix
}


const banner = (
  <header className="container">
    <p className="logo">GTC:</p>
    <p className="tagline">Greenville Tech Calendar</p>
  </header>
)

const calendarHeader = (
  <tr className="cal-header">
    <td>Sunday</td>
    <td>Monday</td>
    <td>Tuesday</td>
    <td>Wednesday</td>
    <td>Thursday</td>
    <td>Friday</td>
    <td>Saturday</td>
  </tr>
)

class DisplayMonth extends Component {
  constructor(props) {
    super(props)
    this.changeMonth = this.changeMonth.bind(this)
  }

  changeMonth(e){
    this.props.changeMonth(e.target.value)
  }

  render() {
    return (
      <div className="date-controls">
        <span><button onClick={this.changeMonth} value="backwards">previous</button></span>
        <span className="display-month">{this.props.monthName}, {this.props.year}</span>
        <span><button onClick={this.changeMonth} value="forwards">next</button></span>
      </div>
    )
  }
}

function Calendar(props){
  return (
    <table className="calendar">
      {props.calendarHeader}
      <MonthWeek weekDates={props.dateMatrix[0]}/>
      <MonthWeek weekDates={props.dateMatrix[1]}/>
      <MonthWeek weekDates={props.dateMatrix[2]}/>
      <MonthWeek weekDates={props.dateMatrix[3]}/>
      <MonthWeek weekDates={props.dateMatrix[4]}/>
      <MonthWeek weekDates={props.dateMatrix[5]}/>
    </table>
  )
}

function MonthWeek(props){
  return (
    <tr className="month-row">
      <MonthDay date={props.weekDates[0]}/>
      <MonthDay date={props.weekDates[1]}/>
      <MonthDay date={props.weekDates[2]}/>
      <MonthDay date={props.weekDates[3]}/>
      <MonthDay date={props.weekDates[4]}/>
      <MonthDay date={props.weekDates[5]}/>
      <MonthDay date={props.weekDates[6]}/>
    </tr>
  )
}

function MonthDay(props){
  return (
    <td className="month-day-box">
      {props.date.getDate()}
    </td>
  )
}



export default App;
