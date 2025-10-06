const API_BASE_URL = 'https://api.videosdk.live';

export const getTokenForJoiningSession = async (sessionData, participantId) => {
  const tokenResponse = await fetch(`${import.meta.env.VITE_API_URL}/meeting/meeting-join-token`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ sessionData, participantId }), // send argument here
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to get session token');
  }

  const tokenData = await tokenResponse.json();
  return tokenData.data.token;
};

export const createMeeting = async ({ token }) => {
  const url = `${API_BASE_URL}/v2/rooms`;
  const options = {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
  };

  const response = await fetch(url, options);
  const data = await response.json();

  if (data.roomId) {
    return { meetingId: data.roomId, err: null };
  } else {
    return { meetingId: null, err: data.error };
  }
};

export const validateMeeting = async ({ meetingId, token }) => {
  const url = `${API_BASE_URL}/v2/rooms/validate/${meetingId}`;

  const options = {
    method: 'GET',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
  };

  const response = await fetch(url, options);
  console.log(response);

  if (response.status === 400) {
    const data = await response.text();
    return { fetchedMeetingId: null, err: data };
  }

  const data = await response.json();

  if (data.roomId) {
    return { fetchedMeetingId: data.roomId, err: null };
  } else {
    return { fetchedMeetingId: null, err: data.error };
  }
};
