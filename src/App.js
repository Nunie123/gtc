import React, { Component } from 'react'
import './App.css'
import fetch from 'isomorphic-fetch'
// import '../node_modules/flexboxgrid/css/flexboxgrid.min.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.changeMonth = this.changeMonth.bind(this)
    this.state = {
      date: new Date(),
      events: []
    }
  }

  componentDidMount(){
    fetch("http://nunes.online/api/gtc")
      .then(response => response.json())
      .then(events => events.map(event=>({...event, time: new Date(event.time)})))
      .then(events => this.setState({events}))
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
          dateMatrix = {getMonthDates(year, month)}
          events = {this.state.events}/>
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
      <div className="date-controls container">
        <button onClick={this.changeMonth} value="backwards">previous</button>
        <div className="display-month">{this.props.monthName}, {this.props.year}</div>
        <button onClick={this.changeMonth} value="forwards">next</button>
      </div>
    )
  }
}

function Calendar(props){
  const firstDay = new Date(props.dateMatrix[0][0])
  const lastDay = new Date(props.dateMatrix[5][6])    //this assumes the array will be 6x7
  const dayBefore = new Date(new Date(firstDay).setDate(firstDay.getDate()-1))    //nested new Date is needed to ensure setDate works on a copy, not a reference
  const dayAfter = new Date(new Date(lastDay).setDate(lastDay.getDate()+1))       //outer new Date converts unix timestamp to Date object
  const filteredEvents = props.events.filter(event => event.time>dayBefore && event.time<dayAfter)

  return (
    <table className="calendar">
      {props.calendarHeader}
      <MonthWeek weekDates={props.dateMatrix[0]} events={filteredEvents}/>
      <MonthWeek weekDates={props.dateMatrix[1]} events={filteredEvents}/>
      <MonthWeek weekDates={props.dateMatrix[2]} events={filteredEvents}/>
      <MonthWeek weekDates={props.dateMatrix[3]} events={filteredEvents}/>
      <MonthWeek weekDates={props.dateMatrix[4]} events={filteredEvents}/>
      <MonthWeek weekDates={props.dateMatrix[5]} events={filteredEvents}/>
    </table>
  )
}

function MonthWeek(props){
  return (
    <tr className="month-row">
      <MonthDay date={props.weekDates[0]} events={props.events}/>
      <MonthDay date={props.weekDates[1]} events={props.events}/>
      <MonthDay date={props.weekDates[2]} events={props.events}/>
      <MonthDay date={props.weekDates[3]} events={props.events}/>
      <MonthDay date={props.weekDates[4]} events={props.events}/>
      <MonthDay date={props.weekDates[5]} events={props.events}/>
      <MonthDay date={props.weekDates[6]} events={props.events}/>
    </tr>
  )
}

function MonthDay(props){
  const today = props.date
  const eventsArray = props.events.filter(function(event){
    return (today.getFullYear() === event.time.getFullYear()
    && today.getMonth() === event.time.getMonth()
    && today.getDate() === event.time.getDate())
  })

  return (
    <td className="month-day-box">
      <div>{today.getDate()}</div>
      <div className="inner-box">
        {eventsArray.map((event, index)=>(
          <div className="event" key={index}>
            {event.time.toLocaleTimeString('en-US', {hour:"2-digit", minute:"numeric"})
              .replace(" ","")
              .replace(":00","")
              .replace("PM","pm")
              .replace("AM","am")}
            <span className="name"> {event.group_name}</span>
          </div>
        ))}
      </div>
    </td>
  )
}



export default App;
