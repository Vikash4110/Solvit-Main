import { wrapper } from "../utils/wrapper.js";
import { RecurringAvailability } from "../models/recurringAvailability-model.js";
import { GeneratedSlot } from "../models/generatedSlots-model.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import mongoose from "mongoose";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";

import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);



const settingRecurringAvailability = wrapper(async (req, res) => {
  const counselorId = req.verifiedClientId;
  const { weeklyAvailability } = req.body;

  if (!weeklyAvailability || weeklyAvailability.length !== 7) {
    return res.status(400).json({
      status: 400,
      message: "Set availability for all days of the week",
    });
  }

  // Validate all days first before DB operations
  for (let day of weeklyAvailability) {
    if (!day.dayOfWeek) {
      return res.status(400).json({
        status: 400,
        message: "Day of the week is required",
      });
    }

    if (day.isAvailable && (!day.timeRanges || day.timeRanges.length === 0)) {
      return res.status(400).json({
        status: 400,
        message: `Please provide at least one time slot for ${day.dayOfWeek}`,
      });
    }
    //checking that to same timeranges for the same day should not be there
    
    for(let i=0 ; i<day.timeRanges.length ; i++ ){
     
      const timeStartTime = dayjs(`2000-01-01 ${day.timeRanges[i].startTime}`, 'YYYY-MM-DD hh:mm A') //dummy date
      const timeEndTime = dayjs(`2000-01-01 ${day.timeRanges[i].endTime}`, 'YYYY-MM-DD hh:mm A')
      if(!timeStartTime.isBefore(timeEndTime)){
         return res.status(400).json({
            status : 400,
            message : `Invalid time range : ${timeStartTime.format("hh:mm A")} - ${timeEndTime.format("hh:mm A")} for ${day.dayOfWeek}`
          })
      }
      
     
      
      for(let j=0 ; j<day.timeRanges.length ; j++ ){
        
        if(i===j) {continue};
    
        const time1StartTime = dayjs(`2000-01-01 ${day.timeRanges[j].startTime}`, 'YYYY-MM-DD hh:mm A')        
        const time1EndTime = dayjs(`2000-01-01 ${day.timeRanges[j].endTime}`, 'YYYY-MM-DD hh:mm A')
        

        if(timeStartTime.isSame(time1StartTime) && timeEndTime.isSame(time1EndTime)){
          return res.status(400).json({
            status : 400,
            message : `Duplicate time range : ${day.timeRanges[i].startTime} - ${day.timeRanges[i].endTime} for ${day.dayOfWeek}`
          })
        }
        if( (timeStartTime.isSame(time1StartTime) &&timeEndTime.isAfter(time1EndTime)) || (timeStartTime.isBefore(time1StartTime) && timeEndTime.isSame(time1EndTime)) || timeStartTime.isBefore(time1StartTime) && timeEndTime.isAfter(time1EndTime)  ){
          return res.status(400).json({
            status : 400,
            message : `The time range : ${day.timeRanges[j].startTime} - ${day.timeRanges[j].endTime} already covers in time range : ${day.timeRanges[i].startTime} - ${day.timeRanges[i].endTime} for ${day.dayOfWeek}`
          })
        }
        if( (timeStartTime.isBefore(time1StartTime) &&timeEndTime.isBefore(time1EndTime) && time1StartTime.isBefore(timeEndTime))|| (timeStartTime.isAfter(time1StartTime) && timeEndTime.isAfter(time1EndTime) && timeStartTime.isBefore(time1EndTime))){
          return res.status(400).json({
            status : 400,
            message : `The time ranges : ${day.timeRanges[j].startTime} - ${day.timeRanges[j].endTime} and ${day.timeRanges[i].startTime} - ${day.timeRanges[i].endTime} are overlapping for ${day.dayOfWeek}`
          })
        }
        
      }
    }  
    
  }  
  //Clean previous availability to avoid duplication
  await RecurringAvailability.deleteMany({ counselorId });

  // Save new availability
  for (let day of weeklyAvailability) {
    await RecurringAvailability.create({
      counselorId,
      dayOfWeek: day.dayOfWeek,
      isAvailable: day.isAvailable,
      timeRanges: day.isAvailable ? day.timeRanges : [],
    });
  }  

  res.status(200).json({
    status: 200,
    message: "Weekly availability set successfully",
  });
});



const getMyRecurringAvailability = wrapper(async (req, res) => {
  const counselorId = req.verifiedClientId;
  const availability = await RecurringAvailability.find({ counselorId });
  if(!availability){
    return res.status(404).json({
      status : 404,
      message : "Availability has been not set"
    })
  }
  res.status(200).json({
    status: 200,
    availability,
  });
});


const generatingActualSlotsFromRecurringAvailability = wrapper(
  async (req, res) => {
    const startDate = dayjs().tz("Asia/Kolkata").startOf("day"); 
    const endDate = startDate.add(30, "day").endOf("day");

    const counselorId = req.verifiedClientId;

    //deleting all prior slots 
    await GeneratedSlot.deleteMany({counselorId , isBooked:false})

    let totalSlotsGenerated = 0;    
      const weeklyAvailability = await RecurringAvailability.find({
        counselorId,
        isAvailable: true
      });
      
      
      if (!weeklyAvailability.length) {
        console.log("No Weekly Availabliy of the counselor is found")
        return res.status(404).json({
          status :404,
          message : "No Weekly Availabliy ofthe counselor is found"
        })
      
      } ;

      for (
        let date = startDate.clone();
        date.isBefore(endDate);
        date = date.add(1, "day")
      ) {
        const dayOfWeek = date.format("dddd");

        const availability = weeklyAvailability.find(
          (entry) => entry.dayOfWeek === dayOfWeek
        );

        if (!availability) continue;
       

        for (const range of availability.timeRanges) {
          const { startTime, endTime } = range;
          

          if (!endTime || !startTime ) continue;
          let slotStart 
          let slotEnd

          if(date.isSame(startDate)){  
            const currentTime = dayjs().tz("Asia/Kolkata")
            slotStart = dayjs(`${date.format("YYYY-MM-DD")} ${startTime}`,"YYYY-MM-DD hh:mm A");
            slotEnd = dayjs(`${date.format("YYYY-MM-DD")} ${endTime}`,"YYYY-MM-DD hh:mm A");
            if(currentTime.isAfter(slotEnd) || currentTime.isSame(slotEnd)){
              continue
            } 
            else if(currentTime.isBefore(slotEnd) && currentTime.isAfter(slotStart)){
              const minutes = currentTime.minute();
              const nextHalfHour = currentTime.minute(minutes < 30 ? 30 : 0).second(0).millisecond(0);
              const finalTime = minutes < 30 ? nextHalfHour : nextHalfHour.add(1, "hour");
              slotStart = dayjs(finalTime.format("YYYY-MM-DD hh:mm A"))
            }
            else if(currentTime.isSame(slotStart)){
             slotStart = dayjs(slotStart.add(30, "minute"));
            }              

          }
          else{
            slotStart = dayjs(
            `${date.format("YYYY-MM-DD")} ${startTime}`,
            "YYYY-MM-DD hh:mm A"
          );
          slotEnd = dayjs(
            `${date.format("YYYY-MM-DD")} ${endTime}`,
            "YYYY-MM-DD hh:mm A"
          );         

          }      
          

          let slotTime = slotStart.clone();
        
       

          while (slotTime.isBefore(slotEnd) && slotTime.add(45,"minutes").isBefore(slotEnd)) {       
            
            const slotStartStr = slotTime.format("hh:mm A");
            const slotEndStr = slotTime.add(45, "minute").format("hh:mm A");            

            const exists = await GeneratedSlot.exists({
              counselorId: new mongoose.Types.ObjectId(counselorId),
              date: date.format("YYYY-MM-DD"),
               startTime: slotStartStr,
            });


            if (!exists) {
              await GeneratedSlot.create({
                counselorId,
                date: date.format("YYYY-MM-DD"),  //acc to local IST
                startTime: slotStartStr,
                endTime: slotEndStr,
                generatedFromRecurringId: availability._id,
                
              });
              totalSlotsGenerated++;
            }

            slotTime = slotTime.add(45, "minute");
          }
        }
      }
    

    return res.status(200).json({
      success: true,
      message: "Slots generated successfully",
      totalSlotsGenerated,
    });
  }
);



// Delete old slots
const cleanupOldSlots = async () => {
  const yesterday = dayjs().tz("Asia/Kolkata").subtract(1, "day").endOf("day").toDate();

  const result = await GeneratedSlot.deleteMany({
    date: { $lt: yesterday },
  });

  console.log(`🧹 Deleted ${result.deletedCount} expired slots.`);
};

//fetching the genrated slots 
const getAllgeneratedSlots = wrapper(async(req ,res)=>{
  const counselorId = req.verifiedClientId;
  const slots = await GeneratedSlot.find({counselorId})
  if(!slots){
    return res.status(404).json({
      status : 404,
      message : "no record found"
      
    })
  }
  return res.status(200).json({
    status: 200,
    message : "Slots fetched Successfully",
    slots

  })
})

//Managing the genereted slots (status) for a particular day
const managingSlotsOfADay = wrapper(async (req, res) => {
  const counselorId = req.verifiedClientId;
  const { date, status } = req.body;

  if (!date || !status) {
    return res.status(400).json({
      status: 400,
      message: "Date and status are required",
    });
  }

  const possibleStatus = ["available", "delete", "unavailable"];
  if (!possibleStatus.includes(status)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid status passed",
    });
  }

  const requiredslots = await GeneratedSlot.find({ counselorId, date });
  if (!requiredslots || requiredslots.length === 0) {
    return res.status(404).json({
      status: 404,
      message: `No slots found for the Date: ${date}`,
    });
  }
  for(let slot of requiredslots){
    if(slot.isBooked){
      return res.status(400).json({
        status : 400,
        message : "Can't perform the operation as there are already booked slots also"
      })
    }
  }

  if (status === "delete") {
    await GeneratedSlot.deleteMany({ counselorId, date });
  } else {
    for (let slot of requiredslots) {
      slot.status = status;
      await slot.save({ validateBeforeSave: false });
    }
  }

  res.status(200).json({
    status: 200,
    message: `Updation Successfull!!`,
  });
});

//managing individual slot 
const managingIndividualSlot = wrapper(async(req ,res)=>{
  const {slotId , status}= req.body
  if(!slotId || !status){
    return res.status(400).json({
      status: 400,
      message: "SlotId and status are required",
    });
  }
  const possibleStatus = ["available", "delete", "unavailable",];
  if (!possibleStatus.includes(status)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid status passed",
    });
  }

  const requiredSlot = await GeneratedSlot.findById(slotId)
  if(!requiredSlot){
    return res.status(400).json({
      status: 400,
      message: "No slot found for passed ID",
    });
  }
  if(requiredSlot.isBooked){
    return res.status(400).json({
      status: 400,
      message: "Can't change status as it is booked",
    });
  }
   if (status === "delete") {
    await GeneratedSlot.deleteOne({_id : slotId});
  } else {    
      requiredSlot.status = status;
      await requiredSlot.save({ validateBeforeSave: false });    
  }

  res.status(200).json({
    status: 200,
    message: `Updation Successfull!!`,
  });



})
export {
  settingRecurringAvailability,
 
  getMyRecurringAvailability,
  generatingActualSlotsFromRecurringAvailability,
  cleanupOldSlots,
  getAllgeneratedSlots,
  managingIndividualSlot,
  managingSlotsOfADay
};
