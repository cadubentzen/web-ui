import React from 'react';
import { Workout,Segment } from 'incyclist-services';

import { WorkoutPanelView } from './WorkoutPanelView';

export default {
    component: WorkoutPanelView,
    
    title: 'Modules/Workout/Dashboard',
  };

const Template = args => <div style={{ width: '18vw', height: '45vh', background: '#222' }}><WorkoutPanelView {...args} /></div>
let workout

try{
    const wo = new Workout({name:'Test Workout'});

    const s = new Segment( {  repeat: 10,
        steps: [
            { duration: 180, power:{min:80, max:100,type:'pct of FTP'}, steady:true, work:true } ,
            { duration: 180, power:{min:100, max:120,type:'pct of FTP'}, steady:true, work:true } ,
            { duration: 180, power:{min:120, max:140,type:'pct of FTP'}, steady:true, work:true } 
        ]
    })
    wo.addSegment( s)
    workout = wo;    
}
catch(err) {
    console.log('~~~ ERROR',err)
}



const step = { duration: 300, remaining: 125, time: 175, minPower: 180, maxPower: 200, minCadence: 85, maxCadence: 95 }

export const Default = Template.bind({});
Default.args = { workout, title: 'Threshold 3 / 6', ftp: 200, current: step }

export const WithHeartRate = Template.bind({});
WithHeartRate.args = { workout, title: 'Threshold 3 / 6', current: { ...step, minHrm: 130, maxHrm: 140 } }

export const MinEqualsMax = Template.bind({});
MinEqualsMax.args = { workout, title: 'Sprint', current: { ...step, minPower: 300, maxPower: 300 } }

export const MaxOnly = Template.bind({});
MaxOnly.args = { workout, title: 'Recovery', current: { ...step, minPower: undefined, maxPower: 120 } }

export const StepChangeFlash = Template.bind({});
StepChangeFlash.args = { workout, title: 'Threshold 4 / 6', current: step, stepPulse: { type: 'flash', ts: 1 } }

export const WithZoom = Template.bind({});
WithZoom.args = { workout, title: 'Zoomed', current: { ...step, time: 9 * 60 * 3 + 20 }, start: 9 * 60 * 3 + 10, stop: 9 * 60 * 3 + 10 + 60 * 10 }
