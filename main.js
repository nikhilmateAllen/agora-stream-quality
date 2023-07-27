import AgoraRTC from "agora-rtc-sdk-ng"

let options =
{
  // Pass your App ID here.
  appId: '',
  // Set the channel name.
  channel: '',
  // Pass your temp token here.
  token: '',
  // Set the user ID.
  uid: 0,
  // Set the user role
  role: 'host', //audience
  optimizationMode: 'detail'
};

let channelParameters =
{
  // A variable to hold a local audio track.
  localAudioTrack: null,
  // A variable to hold a local video track.
  localVideoTrack: null,
  // A variable to hold a remote audio track.
  remoteAudioTrack: null,
  // A variable to hold a remote video track.
  remoteVideoTrack: null,
  // A variable to hold the remote user id.s
  remoteUid: null,
};
async function startBasicCall() {
  // A variable to track the state of remote video quality.
  var isHighRemoteVideoQuality = false;
  // A variable to track the state of device test.
  var isDeviceTestRunning = false;
  // Variables to hold the Audio/Video tracks for device testing.
  var videoTrack;
  var audioTrack;
  // A variable to reference the audio devices dropdown.
  var audioDevicesDropDown;
  // A variable to reference the video devices dropdown.
  var videoDevicesDropDown;

  // Create an instance of the Agora Engine
  const agoraEngine = AgoraRTC.createClient({ mode: "live", codec: "vp9" });
  // Dynamically create a container in the form of a DIV element to play the remote video track.
  const remotePlayerContainer = document.createElement("div");
  // Dynamically create a container in the form of a DIV element to play the local video track.
  const localPlayerContainer = document.createElement('div');
  // Specify the ID of the DIV container. You can use the uid of the local user.
  localPlayerContainer.id = options.uid;
  // Set the textContent property of the local video container to the local user id.
  localPlayerContainer.textContent = "Local user " + options.uid;
  // Set the local video container size.
  localPlayerContainer.style.width = "640px";
  localPlayerContainer.style.height = "480px";
  localPlayerContainer.style.padding = "15px 5px 5px 5px";
  // Set the remote video container size.
  remotePlayerContainer.style.width = "640px";
  remotePlayerContainer.style.height = "480px";
  remotePlayerContainer.style.padding = "15px 5px 5px 5px";

  AgoraRTC.getDevices()
    .then(devices => {
      const audioDevices = devices.filter(function (device) {
        return device.kind === "audioinput";
      });
      const videoDevices = devices.filter(function (device) {
        return device.kind === "videoinput";
      });
      audioDevicesDropDown = document.getElementById("audioDevices");
      videoDevicesDropDown = document.getElementById("videoDevices");
      for (let i = 0; i < audioDevices.length; i++) {
        var option = document.createElement("option");
        option.text = audioDevices[i].label;
        option.value = audioDevices[i].deviceId;
        audioDevicesDropDown.appendChild(option)
      }
      for (let i = 0; i < videoDevices.length; i++) {
        var option = document.createElement("option");
        option.text = videoDevices[i].label;
        option.value = videoDevices[i].deviceId;
        videoDevicesDropDown.appendChild(option)
      }
    });

  agoraEngine.on("connection-state-change", (curState, prevState, reason) => {

    // The sample code uses debug console to show the connection state. In a real-world application, you can add
    // a label or a icon to the user interface to show the connection state. 

    // Display the current connection state.
    console.log("Connection state has changed to :" + curState);
    // Display the previous connection state.
    console.log("Connection state was : " + prevState);
    // Display the connection state change reason.
    console.log("Connection state change reason : " + reason);
  });
  // Listen for the "user-published" event to retrieve a AgoraRTCRemoteUser object.
  agoraEngine.on("user-published", async (user, mediaType) => {
    // Subscribe to the remote user when the SDK triggers the "user-published" event.
    await agoraEngine.subscribe(user, mediaType);
    console.log("subscribe success");
    // Subscribe and play the remote video in the container If the remote user publishes a video track.
    if (mediaType == "video") {
      // Retrieve the remote video track.
      channelParameters.remoteVideoTrack = user.videoTrack;
      // Retrieve the remote audio track.
      channelParameters.remoteAudioTrack = user.audioTrack;
      // Save the remote user id for reuse.
      channelParameters.remoteUid = user.uid.toString();
      // Specify the ID of the DIV container. You can use the uid of the remote user.
      remotePlayerContainer.id = user.uid.toString();
      channelParameters.remoteUid = user.uid.toString();
      remotePlayerContainer.textContent = "Remote user " + user.uid.toString();
      // Append the remote container to the page body.
      document.body.append(remotePlayerContainer);
      if (options.role != 'host') {
        // Play the remote video track.
        channelParameters.remoteVideoTrack.play(remotePlayerContainer);
      }
    }
    // Subscribe and play the remote audio track If the remote user publishes the audio track only.
    if (mediaType == "audio") {
      // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
      channelParameters.remoteAudioTrack = user.audioTrack;
      // Play the remote audio track. No need to pass any DOM element.
      channelParameters.remoteAudioTrack.play();
    }
    // Listen for the "user-unpublished" event.
    agoraEngine.on("user-unpublished", user => {
      console.log(user.uid + "has left the channel");
    });
  });
  // Get the uplink network condition
  agoraEngine.on("network-quality", (quality) => {
    if (quality.uplinkNetworkQuality == 1) {
      document.getElementById("upLinkIndicator").innerHTML = "Excellent";
      document.getElementById("upLinkIndicator").style.color = "green";
    }
    else if (quality.uplinkNetworkQuality == 2) {
      document.getElementById("upLinkIndicator").innerHTML = "Good";
      document.getElementById("upLinkIndicator").style.color = "yellow";
    }
    else (quality.uplinkNetworkQuality >= 4)
    {
      document.getElementById("upLinkIndicator").innerHTML = "Poor";
      document.getElementById("upLinkIndicator").style.color = "red";
    }
  });

  // Get the downlink network condition
  agoraEngine.on("network-quality", (quality) => {
    if (quality.downlinkNetworkQuality == 1) {
      document.getElementById("downLinkIndicator").innerHTML = "Excellent";
      document.getElementById("downLinkIndicator").style.color = "green";
    }
    else if (quality.downlinkNetworkQuality == 2) {
      document.getElementById("downLinkIndicator").innerHTML = "Good";
      document.getElementById("downLinkIndicator").style.color = "yellow";
    }
    else if (quality.downlinkNetworkQuality >= 4) {
      document.getElementById("downLinkIndicator").innerHTML = "Poor";
      document.getElementById("downLinkIndicator").style.color = "red";
    }
  });
  window.onload = function () {
    document.getElementById('testDevices').onclick = async function () {
      if (isDeviceTestRunning == false) {
        videoTrack = AgoraRTC.createCameraVideoTrack({ cameraId: videoDevicesDropDown.value });
        audioTrack = AgoraRTC.createMicrophoneAudioTrack({ microphoneId: audioDevicesDropDown.value });
        document.body.append(localPlayerContainer);
        (await videoTrack).play(localPlayerContainer);
        (await audioTrack).play();
        isDeviceTestRunning = true;
        document.getElementById("testDevices").innerHTML = "Stop test";
      }
      else {
        document.getElementById("testDevices").innerHTML = "Start audio/video device test";
        isDeviceTestRunning = false;
        let Div = document.getElementById(localPlayerContainer.id);
        Div.remove();
        (await videoTrack).close();
        (await audioTrack).close();
      }
    }
    document.getElementById("statistics").onclick = async function () {
      // The sample code uses debug console to show the call-quality statistics. In a real-world application, you can
      // add label or paragraph to the user interface to show the call-quality statistics.

      // Collect the call quality statistics.
      var localAudioStats = agoraEngine.getLocalAudioStats();
      console.log("Local audio stats = { sendBytes :" + localAudioStats.sendBytes + ", sendBitrate :" + localAudioStats.sendBitrate + ", sendPacketsLost :"
        + localAudioStats.sendPacketsLost + " }");
      var localVideoStats = agoraEngine.getLocalVideoStats();
      console.log("Local video stats = { sendBytes :" + localVideoStats.sendBytes + ", sendBitrate :" + localVideoStats.sendBitrate +
        ", sendPacketsLost :" + localVideoStats.sendPacketsLost + " }");
      var remoteAudioStats = agoraEngine.getRemoteAudioStats()[channelParameters.remoteUid];
      console.log("Remote audio stats = { receiveBytes :" + remoteAudioStats.receivedBytes + ", receiveBitrate :" + remoteAudioStats.receiveBitrate +
        ", receivePacketsLost :" + remoteAudioStats.receivePacketsLost + "}");
      var remoteVideoStats = agoraEngine.getRemoteVideoStats()[channelParameters.remoteUid];
      console.log(" Local video stats = { receiveBytes :" + remoteVideoStats.receiveBytes + ", receiveBitrate :" + remoteVideoStats.receiveBitrate +
        ", receivePacketsLost :" + remoteVideoStats.receivePacketsLost + " }");
      var rtcStats = agoraEngine.getRTCStats();
      console.log("Channel statistics = { UserCount :" + rtcStats.UserCount + ", OutgoingAvailableBandwidth :" + rtcStats.OutgoingAvailableBandwidth +
        ", RTT :" + rtcStats.RTT + " }");
    }

    // Listen to the Leave button click event.
    document.getElementById('leave').onclick = async function () {
      // Destroy the local audio and video tracks.
      channelParameters.localAudioTrack.close();
      channelParameters.localVideoTrack.close();
      // Remove the containers you created for the local video and remote video.
      removeVideoDiv(remotePlayerContainer.id);
      removeVideoDiv(localPlayerContainer.id);
      // Leave the channel
      await agoraEngine.leave();
      console.log("You left the channel");
      // Refresh the page for reuse
      window.location.reload();
    }
    document.getElementById('host').onclick = async function () {
      // Save the selected role in a variable for reuse.
      options.role = 'host';
      // Call the method to set the role as Host.
      await agoraEngine.setClientRole(options.role);
      await join()
      if (channelParameters.localVideoTrack != null) {
        // Publish the local audio and video track in the channel.
        await agoraEngine.publish([channelParameters.localAudioTrack, channelParameters.localVideoTrack]);
        // Stop playing the remote video.
        channelParameters.remoteVideoTrack.stop();
        // Start playing the local video.
        channelParameters.localVideoTrack.play(localPlayerContainer);
      }
    }
    document.getElementById('audience').onclick = async function () {
      options.role = 'audience';
      if (channelParameters.localAudioTrack != null && channelParameters.localVideoTrack != null) {
        if (channelParameters.remoteVideoTrack != null) {
          // Replace the current video track with remote video track
          await channelParamaters.localVideoTrack.replaceTrack(channelParamaters.remoteVideoTrack, true);
        }
      }
      // Call the method to set the role as Audience.
      await agoraEngine.setClientRole(options.role);
      await join()
    }

    document.getElementById('opt-mode').onchange = async function(ev) {
      let mode = ev.target.value
      options.optimizationMode = mode
      if (channelParameters.localVideoTrack != null) {
        await channelParameters.localVideoTrack.setOptimizationMode(mode)
        console.log('Changed Optimization mode')
      }
    }

    async function join(){
      options = {
        ...options,
        // Pass your App ID here.
        appId: document.getElementById('appid').value,
        // Set the channel name.
        channel: document.getElementById('channel').value,
        // Pass your temp token here.
        token: document.getElementById('token').value,
        // Set the user ID.
        uid: 0,
      };
      // Enable dual-stream mode.
      // agoraEngine.enableDualStream();
      if (options.role == '') {
        window.alert("Select a user role first!");
        return;
      }

      // Join a channel.
      await agoraEngine.join(options.appId, options.channel, options.token, options.uid);
      // Create a local audio track from the audio sampled by a microphone.
      channelParameters.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      // Create a local audio track and set an audio profile for the local audio track.
      channelParameters.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack(
        { encoderConfig: "high_quality_stereo", });
      // Create a local video track from the video captured by a camera.
      // Set a video profile.
      channelParameters.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig:
        {
          width: 640,
          // Specify a value range and an ideal value
          height: { ideal: 480, min: 400, max: 500 },
          frameRate: 15,
          bitrateMin: 600,
          bitrateMax: 1000,
          optimizationMode: options.optimizationMode, //balanced, motion

        },
      });

      // Append the local video container to the page body.
      document.body.append(localPlayerContainer);
      // Set a stream fallback option to automatically switch remote video quality when network conditions degrade. 
      agoraEngine.setStreamFallbackOption(channelParameters.remoteUid, 1);
      document.getElementById(remotePlayerContainer.id).addEventListener('click', function () {
        if (isHighRemoteVideoQuality == false) {
          agoraEngine.setRemoteVideoStreamType(channelParameters.remoteUid, 0);
          isHighRemoteVideoQuality = true;
        }
        else {
          agoraEngine.setRemoteVideoStreamType(channelParameters.remoteUid, 1);
          isHighRemoteVideoQuality = false;
        }
      });

      // Publish the local audio and video track if the user joins as a host.
    }
  }
}
startBasicCall();
// Remove the video stream from the container.
function removeVideoDiv(elementId) {
  console.log("Removing " + elementId + "Div");
  let Div = document.getElementById(elementId);
  if (Div) {
    Div.remove();
  }
};
