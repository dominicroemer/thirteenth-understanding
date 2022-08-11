import { isFocusable } from '@testing-library/user-event/dist/utils';
import React, {useState, useEffect} from 'react';
import '../Styles/ClockNav.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';

// const clockContestStart = 1661533200000;
// const clockContestEnd = 1661619600000;

const clockContestStart = 1660201149000;
const clockContestEnd = 1660283681000;


const msInDays = 86400000;
const msInHours = 3600000;
const msInMinutes = 60000;
const msInSeconds = 1000;

const encounterBegan = new Date(1660201801000)
const timeSinceBreak = new Date(1660201201000)


function ClockNav(props) {

    const [headerClock, setHeaderClock] = useState(0);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [timerID, setTimerID] = useState();

    const [contestActive, toggleContestActive] = useState(false)
    const [contestTimeElapsed, setContestTimeElapsed] = useState();
    const [contestTimeRemaining, setContestTimeRemaining] = useState();
    const [contestEncounterElapsed, setContestEncounterElapsed] = useState();

    const [timeBreakString, setTimeBreakString] = useState();
    const [timeEncounterString, setTimeEncounterString] = useState();
    
    
    function clockTick() {
        setCurrentDate(new Date())
    }

    useEffect(() => {
        function calculateTimeDifferential(){
            let timeRemaining = clockContestStart - currentDate;
            let days = 0;
            let hours = 0;
            let minutes = 0;
            let seconds = 0;
            let remainingMillis = timeRemaining;
            let dateString;

            if(timeRemaining >= 0) { // If the contest hasn't begun, go here
                while(remainingMillis > msInDays){
                    days = days + 1;
                    remainingMillis = remainingMillis - msInDays;
                }
                while(remainingMillis > msInHours){
                    hours = hours + 1;
                    remainingMillis = remainingMillis - msInHours;
                }
                while(remainingMillis > msInMinutes){
                    minutes = minutes + 1;
                    remainingMillis = remainingMillis - msInMinutes;
                }
                while(remainingMillis > msInSeconds){
                    seconds = seconds + 1;
                    remainingMillis = remainingMillis - msInSeconds;
                }
                dateString = `${days ? `${days} days, ` : ''} ${hours ? `${hours}:` : ''}${minutes ? `${minutes}:` : ""}${seconds} Remaining`;
                setHeaderClock(dateString);
            } else { //If the contest has begun, do calculations in here
                let timeElapsed = currentDate - clockContestStart;
                while(timeElapsed > msInHours){
                    hours = hours + 1;
                    timeElapsed = timeElapsed - msInHours;
                }
                while(timeElapsed > msInMinutes){
                    minutes = minutes + 1;
                    timeElapsed = timeElapsed - msInMinutes;
                }
                while(timeElapsed > msInSeconds){
                    seconds = seconds + 1;
                    timeElapsed = timeElapsed - msInSeconds;
                }
                dateString = `${hours ? `${hours}:` : ''}${minutes ? `${minutes}:` : ""}${seconds} Elapsed`
                setContestTimeElapsed(dateString)

                // Values here are Actual-1 because code counts 0 as interval when counting down
                let remainingHours = 23 - hours;
                let remainingMinutes = 59 - minutes;
                let remainingSeconds = 60 - seconds;

                let remainingString = `${remainingHours}:${remainingMinutes}:${remainingSeconds === 60 ? '00' : remainingSeconds} Remaining`
                setContestTimeRemaining(remainingString)
            }
            return dateString;
        }

        setTimerID(setInterval(
            () => clockTick(), 
            (clockContestStart - currentDate > msInDays ? 1000 : 1000)
        ));
        calculateTimeDifferential();

        // Return statement clears previous active timerID to prevent overflow of active timers
        return () => {
            clearInterval(timerID);
        }

    }, [currentDate])

    useEffect( () => {
        if(contestTimeElapsed) {
            toggleContestActive(true);
        }
    }, [contestTimeElapsed]);

    useEffect( () => {
        let encounterTimer = currentDate - encounterBegan;
        let breakTimer = currentDate - timeSinceBreak;

        let encounterHours = 0;
        let encounterMinutes = 0;
        let encounterSeconds = 0;
        while( encounterTimer > msInHours){
            encounterHours = encounterHours + 1;
            encounterTimer = encounterTimer - msInHours;
        }
        while( encounterTimer > msInMinutes){
            encounterMinutes = encounterMinutes + 1;
            encounterTimer = encounterTimer - msInMinutes;
        }
        while( encounterTimer > msInSeconds){
            encounterSeconds = encounterSeconds + 1;
            encounterTimer = encounterTimer - msInSeconds;
        }
        let encounterString = `${encounterHours ? `${encounterHours}:` : ''}${encounterMinutes ? `${encounterMinutes}:` : ''}${encounterSeconds ? `${encounterSeconds}:` : ''} spent on this encounter`;

        setTimeEncounterString(encounterString);

        let breakHours = 0;
        let breakMinutes = 0;
        let breakSeconds = 0;
        while( breakTimer > msInHours){
            breakHours = breakHours + 1;
            breakTimer = breakTimer - msInHours;
        }
        while( breakTimer > msInMinutes){
            breakMinutes = breakMinutes + 1;
            breakTimer = breakTimer - msInMinutes;
        }
        while( breakTimer > msInSeconds){
            breakSeconds = breakSeconds + 1;
            breakTimer = breakTimer - msInSeconds;
        }
        let breakString = `${breakHours ? `${breakHours}:` : ''}${breakMinutes ? `${breakMinutes}:` : ''}${breakSeconds ? `${breakSeconds}:` : ''} since last break`;

        setTimeBreakString(breakString);




    }, [encounterBegan, timeSinceBreak, currentDate])

    // useEffect( () => {
        // let timeSince = currentDate - 
    // }, [timeSinceBreak])

    return (
        <div className='clockNav'
        style={props.darkMode ? {background: '#1c1c1c', color: '#fff'} : {}}>
            <div className='headerClockContainer'>
                {clockContestStart - currentDate > 0 &&                     
                    <div style={{color: 'red'}}>
                        {headerClock}
                    </div>
                }
                {clockContestStart - currentDate < 0 &&
                    <ActiveClocks 
                        contestTimeElapsed={contestTimeElapsed}
                        contestTimeRemaining={contestTimeRemaining}
                        timeSinceBreak={timeBreakString}
                        encounterTimer={timeEncounterString}
                        />
                }
            </div>
        </div>
    )
}

function ActiveClocks(props) {

    const [expandClocks, toggleExpandClocks] = useState(false);

    function handleExpandClocks(e) {
        e.preventDefault();
        toggleExpandClocks(!expandClocks);
    }

    const [viewClock, setViewClock] = useState()
    const [altClocksOne, setAltClockOne] = useState();
    const [altClocksTwo, setAltClockTwo] = useState();
    const [altClocksThree, setAltClockThree] = useState();

    useEffect(() => {
        setViewClock(props.contestTimeElapsed);
        setAltClockOne(props.contestTimeRemaining);
        setAltClockTwo(props.timeSinceBreak);
        setAltClockThree(props.encounterTimer)
    },[props.contestTimeElapsed, props.contestTimeRemaining, props.timeSinceBreak, props.encounterTimer])

    return (
        <div className='expandClocksContent' style={{color:'green'}}>
            <p>
                {viewClock}
            </p>
        
            <div className="expandClocks" onClick={e => handleExpandClocks(e)}>

            {!expandClocks &&
            <div className='expandClocksContent'>
                <p className='toggleExpandClocks'>
                    <FontAwesomeIcon icon={faAngleDown}/>&nbsp;
                    Show Additional Timers&nbsp;
                    <FontAwesomeIcon icon={faAngleDown}/>
                </p>
            </div>}

            {expandClocks && 
            <div className='expandClocksContent'>
                <div>
                    {altClocksOne}
                </div>
                <div>
                    {altClocksTwo}    
                </div>
                <div>
                    {altClocksThree}    
                </div>
                
                <p className='toggleExpandClocks'>
                    <FontAwesomeIcon icon={faAngleUp}/>&nbsp;
                    Collapse Clocks &nbsp;
                    <FontAwesomeIcon icon={faAngleUp}/>
                </p>
            </div>}
                
            </div>
        </div>
    )
}

export default ClockNav;