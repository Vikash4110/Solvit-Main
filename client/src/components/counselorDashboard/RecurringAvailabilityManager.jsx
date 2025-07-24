import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  Check,
  X,
  Loader,
  AlertTriangle,
} from "lucide-react";

const RecurringAvailabilityComponent = () => {
  const [weeklyAvailability, setWeeklyAvailability] = useState([
    { dayOfWeek: "Monday", isAvailable: false, timeRanges: [] },
    { dayOfWeek: "Tuesday", isAvailable: false, timeRanges: [] },
    { dayOfWeek: "Wednesday", isAvailable: false, timeRanges: [] },
    { dayOfWeek: "Thursday", isAvailable: false, timeRanges: [] },
    { dayOfWeek: "Friday", isAvailable: false, timeRanges: [] },
    { dayOfWeek: "Saturday", isAvailable: false, timeRanges: [] },
    { dayOfWeek: "Sunday", isAvailable: false, timeRanges: [] },
  ]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showDialog, setShowDialog] = useState(false);

  // Fetch existing availability on component mount
  useEffect(() => {
    fetchExistingAvailability();
  }, []);

  const fetchExistingAvailability = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/v1/slotManagement/my-recurring-availability",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.availability && data.availability.length > 0) {
          // Create a map of existing availability
          const availabilityMap = {};
          data.availability.forEach((dayData) => {
            availabilityMap[dayData.dayOfWeek] = {
              isAvailable: dayData.isAvailable,
              timeRanges: dayData.timeRanges || [],
            };
          });

          // Update the state with existing data
          const updatedAvailability = weeklyAvailability.map((day) => ({
            ...day,
            isAvailable: availabilityMap[day.dayOfWeek]?.isAvailable || false,
            timeRanges: availabilityMap[day.dayOfWeek]?.timeRanges || [],
          }));

          setWeeklyAvailability(updatedAvailability);
        }
      }
    } catch (error) {
      console.error("Failed to fetch existing availability:", error);
      setMessage({
        type: "error",
        text: "Failed to load existing availability data",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  // Generate time options in 12-hour format
  const generateTimeOptions = () => {
    const times = [];

    //AM times (12:00 AM to 12:30 AM)
    for (let minute = 0; minute < 60; minute += 30) {
      times.push(`12:${minute.toString().padStart(2, "0")} AM`);
    }
    // AM times (1:00 AM to 11:30 AM)
    for (let hour = 1; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const displayHour = hour === 0 ? 12 : hour;
        times.push(`${displayHour}:${minute.toString().padStart(2, "0")} AM`);
      }
    }

    // 12:00 PM to 12:30 PM
    for (let minute = 0; minute < 60; minute += 30) {
      times.push(`12:${minute.toString().padStart(2, "0")} PM`);
    }

    // PM times (1:00 PM to 11:30 PM)
    for (let hour = 1; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        times.push(`${hour}:${minute.toString().padStart(2, "0")} PM`);
      }
    }

    return times;
  };

  const timeOptions = generateTimeOptions();

  const toggleDayAvailability = (dayIndex) => {
    const updatedAvailability = [...weeklyAvailability];
    updatedAvailability[dayIndex].isAvailable =
      !updatedAvailability[dayIndex].isAvailable;

    if (!updatedAvailability[dayIndex].isAvailable) {
      updatedAvailability[dayIndex].timeRanges = [];
    } else {
      if (updatedAvailability[dayIndex].timeRanges.length === 0) {
        updatedAvailability[dayIndex].timeRanges = [
          { startTime: "9:00 AM", endTime: "10:00 AM" },
        ];
      }
    }

    setWeeklyAvailability(updatedAvailability);
  };

  const addTimeRange = (dayIndex) => {
    const updatedAvailability = [...weeklyAvailability];
    updatedAvailability[dayIndex].timeRanges.push({
      startTime: "9:00 AM",
      endTime: "10:00 AM",
    });
    setWeeklyAvailability(updatedAvailability);
  };

  const removeTimeRange = (dayIndex, timeRangeIndex) => {
    const updatedAvailability = [...weeklyAvailability];
    updatedAvailability[dayIndex].timeRanges.splice(timeRangeIndex, 1);
    setWeeklyAvailability(updatedAvailability);
  };

  const updateTimeRange = (dayIndex, timeRangeIndex, field, value) => {
    const updatedAvailability = [...weeklyAvailability];
    updatedAvailability[dayIndex].timeRanges[timeRangeIndex][field] = value;
    setWeeklyAvailability(updatedAvailability);
  };

  // Validation to ensure end time is after start time
  const isValidTimeRange = (startTime, endTime) => {
    const convertTo24Hour = (time12) => {
      const [time, period] = time12.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let hours24 = hours;

      if (period === "AM" && hours === 12) {
        hours24 = 0;
      } else if (period === "PM" && hours !== 12) {
        hours24 = hours + 12;
      }

      return hours24 * 60 + minutes;
    };

    return convertTo24Hour(endTime) > convertTo24Hour(startTime);
  };

  const handleSaveClick = () => {
    // Validate all time ranges first
    for (let day of weeklyAvailability) {
      if (day.isAvailable) {
        for (let timeRange of day.timeRanges) {
          if (!isValidTimeRange(timeRange.startTime, timeRange.endTime)) {
            setMessage({
              type: "error",
              text: `Invalid time range on ${day.dayOfWeek}: End time must be after start time`,
            });
            return;
          }
        }
      }
    }

    // Show confirmation dialog
    setShowDialog(true);
  };

  const handleConfirmSave = async () => {
    setShowDialog(false);
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/slotManagement/set-recurring-availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
          body: JSON.stringify({ weeklyAvailability }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        
        try {
          const response = await fetch(
            "http://localhost:8000/api/v1/slotManagement/generating-actual-slots",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              credentials: "include",
             
            }
          );
          setMessage({
          type: "success",
          text: "Availability updated and required slots haven been generated successfully!",
        });
        } catch (error) {}
        
      } else {
        setMessage({
          type: "error",
          text: data.message || "Something went wrong",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update availability" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSave = () => {
    setShowDialog(false);
  };

  const getDayShortName = (day) => {
    const shortNames = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun",
    };
    return shortNames[day];
  };

  // Get summary data for the dialog
  const getSummaryData = () => {
    const availableDays = weeklyAvailability.filter((day) => day.isAvailable);
    const totalSlots = weeklyAvailability.reduce(
      (total, day) => total + (day.isAvailable ? day.timeRanges.length : 0),
      0
    );

    return {
      availableDaysCount: availableDays.length,
      totalSlots,
      availableDays: availableDays.map((day) => ({
        day: day.dayOfWeek,
        slots: day.timeRanges.length,
      })),
    };
  };

  // Show loading spinner while fetching initial data
  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">
              Loading your availability settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const summaryData = getSummaryData();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Availability Update
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to update your weekly availability with
                the following settings?
              </p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Available Days:</span>
                  <span className="text-sm font-medium">
                    {summaryData.availableDaysCount} / 7
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Total Time Slots:
                  </span>
                  <span className="text-sm font-medium">
                    {summaryData.totalSlots}
                  </span>
                </div>

                {summaryData.availableDays.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Available on:</p>
                    <div className="flex flex-wrap gap-1">
                      {summaryData.availableDays.map(({ day, slots }) => (
                        <span
                          key={day}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {day} ({slots} slot{slots !== 1 ? "s" : ""})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelSave}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving and genarating slots ..." : "Confirm & Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Set Your Weekly Availability
          </h2>
        </div>
        <p className="text-gray-600">
          Configure your recurring schedule for counseling sessions
        </p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Days Grid */}
      <div className="space-y-6">
        {weeklyAvailability.map((day, dayIndex) => (
          <div
            key={day.dayOfWeek}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            {/* Day Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {getDayShortName(day.dayOfWeek)}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {day.dayOfWeek}
                  </h3>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleDayAvailability(dayIndex)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  day.isAvailable ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    day.isAvailable ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Time Ranges */}
            {day.isAvailable && (
              <div className="space-y-3">
                {day.timeRanges.map((timeRange, timeRangeIndex) => (
                  <div
                    key={timeRangeIndex}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <Clock className="w-4 h-4 text-gray-500" />

                    {/* Start Time */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <select
                        value={timeRange.startTime}
                        onChange={(e) =>
                          updateTimeRange(
                            dayIndex,
                            timeRangeIndex,
                            "startTime",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* End Time */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <select
                        value={timeRange.endTime}
                        onChange={(e) =>
                          updateTimeRange(
                            dayIndex,
                            timeRangeIndex,
                            "endTime",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          !isValidTimeRange(
                            timeRange.startTime,
                            timeRange.endTime
                          )
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                      {!isValidTimeRange(
                        timeRange.startTime,
                        timeRange.endTime
                      ) && (
                        <p className="text-xs text-red-500 mt-1">
                          End time must be after start time
                        </p>
                      )}
                    </div>

                    {/* Time Display Preview */}
                    <div className="flex-1 text-center">
                      <div className="text-xs text-gray-500 mb-1">Session</div>
                      <div
                        className={`text-sm font-medium px-2 py-1 rounded border ${
                          isValidTimeRange(
                            timeRange.startTime,
                            timeRange.endTime
                          )
                            ? "text-gray-700 bg-white"
                            : "text-red-700 bg-red-50 border-red-200"
                        }`}
                      >
                        {timeRange.startTime}
                        <span className="text-gray-400 mx-1">-</span>
                        {timeRange.endTime}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeTimeRange(dayIndex, timeRangeIndex)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove time slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add Time Range Button */}
                <button
                  onClick={() => addTimeRange(dayIndex)}
                  className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Time Slot
                </button>
              </div>
            )}

            {/* Unavailable State */}
            {!day.isAvailable && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Not available on {day.dayOfWeek}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSaveClick}
          disabled={loading}
          className={`px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving and genarating slots ...
            </span>
          ) : (
            "Save Availability and generate slots"
          )}
        </button>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Summary</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <div>Available days: {summaryData.availableDaysCount} / 7</div>
          <div>Total slots: {summaryData.totalSlots}</div>
        </div>
      </div>
    </div>
  );
};

export default RecurringAvailabilityComponent;
