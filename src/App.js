import React, { Component } from 'react'
import './App.css'
import fetch from 'isomorphic-fetch'
// import '../node_modules/flexboxgrid/css/flexboxgrid.min.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.changeMonth = this.changeMonth.bind(this)
    this.viewEvent = this.viewEvent.bind(this)
    this.hideEvent = this.hideEvent.bind(this)
    this.state = {
      date: new Date(),
      allEvents: [],
      eventView: false,
      eventDetails: {}
    }
  }

  componentDidMount(){
    const colors = ['#F44336', '#673AB7', '#03A9F4', '#4CAF50', '#FF5722', '#E91E63', '#3F51B5', '#00BCD4', '#8BC34A', '#FFC107', '#9C27B0', '#2196F3', '#009688', '#C0CA33', '#FF9800']
    const colorArray = colors.concat(colors).concat(colors).concat(colors)
    fetch("https://nunes.online/api/gtc")
      .then(response => response.json())
      .then(events => events.map(event=>({...event, time: new Date(event.time)})))
      .then(events => {
        const allGroups = events.map(event=>event.group_name)
        const uniqueGroups = allGroups.filter((v,i,a)=>a.indexOf(v)===i)
        const colorGroupsArray = uniqueGroups.map((group, index)=>({'group':group, 'color':colorArray[index]}))
        const colorGroupsObject = colorGroupsArray.reduce((obj, cur)=>{
          obj[cur.group]=cur.color
          return obj
        },{})
        const colorEvents = events.map(event=>({...event, 'color':colorGroupsObject[event.group_name]}))
        return colorEvents
      })
      .then(allEvents => this.setState({allEvents}))
  }

  changeMonth(direction){
    let curDate = new Date(this.state.date.getFullYear(), this.state.date.getMonth(), 1)
    if(direction === "backwards"){this.setState({date: new Date(curDate.setMonth(curDate.getMonth()-1))})}
    if(direction === "forwards"){this.setState({date: new Date(curDate.setMonth(curDate.getMonth()+1))})}
  }

  viewEvent(eventDetails){
    this.setState({eventView:true, eventDetails})
  }

  hideEvent(){
    this.setState({eventView:false, eventDetails:{}})
  }

  render(){
    const year = this.state.date.getFullYear()
    const month = this.state.date.getMonth()
    const day = this.state.date.getDate()
    const dateMatrix = getMonthDates(year, month)
    const firstDay = dateMatrix[0][0]
    const lastDay = dateMatrix[5][6]   //this assumes the array will be 6x7
    const dayBefore = new Date(new Date(firstDay).setDate(firstDay.getDate()-1))    //nested new Date is needed to ensure setDate works on a copy, not a reference
    const dayAfter = new Date(new Date(lastDay).setDate(lastDay.getDate()+1))   //outer new Date converts unix timestamp to Date object
    const events = this.state.allEvents.filter(event => event.time>dayBefore && event.time<dayAfter)
    const eventView = this.state.eventView ? <EventView eventDetails={this.state.eventDetails} hideEvent={this.hideEvent}/> : ""

    return (
      <div className="app">
        <DisplayMonth
          monthName={getMonthName(new Date(year, month, day))}
          year={year}
          changeMonth={this.changeMonth}/>
        <Calendar
          dateMatrix = {dateMatrix}
          events = {events}
          viewEvent = {this.viewEvent}/>
        {eventView}
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


class EventView extends Component {
  constructor(props){
    super(props)
    this.hideEvent = this.hideEvent.bind(this)
    this.state = {
      eventDetails: props.eventDetails,
      hideEvent: props.hideEvent
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ eventDetails: nextProps.eventDetails });
  }

  hideEvent(){
    this.state.hideEvent()
  }

  render(){
    const eventDetails = this.state.eventDetails
    const eventName = eventDetails.event_name
    const groupName = eventDetails.group_name
    const eventDate = eventDetails.time.toLocaleString("en-us", {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})
    const eventTime = eventDetails.time.toLocaleTimeString('en-US', {hour:"2-digit", minute:"numeric"}).replace(" ","").replace(":00","").replace("PM","pm").replace("AM","am")
    const eventUrl = eventDetails.url
    const eventDescription = eventDetails.description.replace(/^<(.|\n)*?>/ig, "").replace(/<(.|\n)*?>/ig, "\n").replace(/&amp;/ig, "&").replace(/\n\n/ig,"\n")
    if(eventDetails.venue){
      const eventVenueName = eventDetails.venue.name || ''
      const eventAddress = eventDetails.venue.address || ''
      const eventCity = eventDetails.venue.city || 'Greenville'
      const eventState = eventDetails.venue.state || 'SC'
      const eventZip = eventDetails.venue.zip || ''
      var venue =
`${eventVenueName}
${eventAddress}
${eventCity}, ${eventState} ${eventZip}`
    }

    //console.log(this.state.eventDetails)
    return(
      <div className="modal">
        <div className="event-view">
          <span className="event-view-close" onClick={this.hideEvent}>&times;</span>
          <div className="event-name detail">{eventName}</div>
          <div className="group-name detail container"><div className="label">Hosted by: </div>{groupName}</div>
          <div className="event-date detail container"><div className="label">Hapening on: </div>{eventDate} at {eventTime}</div>
          <div className="venue detail container">
            <div className="label">Located at: </div>

            <div>{venue}</div>
          </div>
          <div className="description detail container"><div className="label">Description: </div><div>{eventDescription}</div></div>
          <div className="event-url detail container"><div className="label">More info at: </div><a href={eventUrl}>{eventUrl}</a></div>
        </div>
      </div>
    )
  }
}

class DisplayMonth extends Component {
  constructor(props) {
    super(props)
    this.state = {
      monthName: props.monthName,
      year: props.year,
      changeMonth: props.changeMonth
    }
    this.updateState = this.updateState.bind(this)
  }

  updateState(e){
    this.state.changeMonth(e.target.value)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ monthName: nextProps.monthName, year: nextProps.year });
  }

  render() {
    const logo = (
      <div className="logo-wrapper">
        <p className="logo">Greenville</p>
        <p className="logo">Technology</p>
        <p className="logo">Calendar</p>
      </div>
    )

    return (
      <header className="header-wrapper">
        {logo}
        <div className="month-wrapper">
          <button className="change-month-btn left" onClick={this.updateState} value="backwards">&lt;</button>
          <div className="display-month">{this.state.monthName}</div>
          <button className="change-month-btn right" onClick={this.updateState} value="forwards">&gt;</button>
        </div>
        <div className="display-year">{this.state.year}</div>
      </header>
    )
  }
}

class Calendar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dateMatrix: props.dateMatrix,
      events: props.events,
      viewEvent: props.viewEvent
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ events: nextProps.events, dateMatrix: nextProps.dateMatrix });
  }

  render(){
    //console.log(this.state.events)
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
    return (
      <table className="calendar">
        <tbody>
          {calendarHeader}
          <MonthWeek weekDates={this.state.dateMatrix[0]} events={this.state.events} viewEvent={this.state.viewEvent}/>
          <MonthWeek weekDates={this.state.dateMatrix[1]} events={this.state.events} viewEvent={this.state.viewEvent}/>
          <MonthWeek weekDates={this.state.dateMatrix[2]} events={this.state.events} viewEvent={this.state.viewEvent}/>
          <MonthWeek weekDates={this.state.dateMatrix[3]} events={this.state.events} viewEvent={this.state.viewEvent}/>
          <MonthWeek weekDates={this.state.dateMatrix[4]} events={this.state.events} viewEvent={this.state.viewEvent}/>
          <MonthWeek weekDates={this.state.dateMatrix[5]} events={this.state.events} viewEvent={this.state.viewEvent}/>
        </tbody>
      </table>
    )
  }
}

class MonthWeek extends Component {
  constructor(props) {
    super(props)
    this.state = {
      weekDates: props.weekDates,
      events: props.events,
      viewEvent: props.viewEvent
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ events: nextProps.events, weekDates: nextProps.weekDates });
  }

  render(){
    //console.log(this.state)
    return (
      <tr className="month-row">
        <MonthDay date={this.state.weekDates[0]} events={this.state.events} viewEvent={this.state.viewEvent}/>
        <MonthDay date={this.state.weekDates[1]} events={this.state.events} viewEvent={this.state.viewEvent}/>
        <MonthDay date={this.state.weekDates[2]} events={this.state.events} viewEvent={this.state.viewEvent}/>
        <MonthDay date={this.state.weekDates[3]} events={this.state.events} viewEvent={this.state.viewEvent}/>
        <MonthDay date={this.state.weekDates[4]} events={this.state.events} viewEvent={this.state.viewEvent}/>
        <MonthDay date={this.state.weekDates[5]} events={this.state.events} viewEvent={this.state.viewEvent}/>
        <MonthDay date={this.state.weekDates[6]} events={this.state.events} viewEvent={this.state.viewEvent}/>
      </tr>)
  }
}

class MonthDay extends Component {
  constructor(props) {
    super(props)
    this.state = {
      date: props.date,
      events: props.events,
      viewEvent: props.viewEvent
    }
    this.getTodaysEvents = this.getTodaysEvents.bind(this)
    this.displayTime = this.displayTime.bind(this)
    this.viewEvent = this.viewEvent.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ events: nextProps.events, date: nextProps.date });
  }

  getTodaysEvents = function(events, date){
    return (events.filter(function (event) {
      return date.getFullYear() === event.time.getFullYear() && date.getMonth() === event.time.getMonth() && date.getDate() === event.time.getDate()
    }))
  }

  displayTime = date => date.toLocaleTimeString('en-US', {hour:"2-digit", minute:"numeric"}).replace(" ","").replace(":00","").replace("PM","pm").replace("AM","am")

  viewEvent = (event) => {
    this.state.viewEvent(event)
    //console.log(event)
  }

  render(){
    const todaysEvents = this.getTodaysEvents(this.state.events, this.state.date) || []
    return (
      <td className="month-day-box">
        <div className="date-number">{this.props.date.getDate()}</div>
        <div className="inner-box">
          {todaysEvents.map((event, index)=>(
            <div className="event-button-wrapper">
              <button className="event" style={{backgroundColor: event.color}} key={index} onClick={this.viewEvent.bind(this, event)}>
                {this.displayTime(event.time)}
                <span className="name"> {event.group_name}</span>
              </button>
            </div>
          ))}
        </div>
      </td>
    )
  }

}



export default App;
