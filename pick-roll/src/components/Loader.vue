<script>
    export default {
        name: 'Loader',
    }
</script>

<template>
<div class="basketball">
    <div class="ball">
    <div class="lines"></div>
    </div>
  <div class="shadow"></div>
  </div>
  
</template>
    
<style scoped>

body {
  display: flex;
  align-items: center;
  justify-content: center;
  height:100vh;
}

.basketball {
  position: relative;
  top: 200px;
  left: 20px;
}

.ball {
  position: absolute;
  background-color: #e76f51;
  border-radius:50%;
  width:100px;
  height:100px;
  overflow: hidden;
  border: 3px solid #333;
  animation: bounce 1.5s ease-in infinite;
}

@keyframes bounce {
  0% {transform: translate3d(0, 0, 0) rotate(0deg);}
  25% {transform: translate3d(0, -185px, 0) rotate(90deg);}
  50% {transform: translate3d(0, 0, 0) rotate(180deg);}
  75% {transform: translate3d(0, -185px, 0) rotate(270deg);}
  100% {transform: translate3d(0, 0, 0) rotate(360deg);}
}

.ball:before, .ball:after {
  content:"";
  position: absolute;
  background-color: #333;
  width:110px;
  height:3px;
  top:50px;
  left:-5px;
}

.ball:before {
  transform: rotate(45deg);
}

.ball:after {
  transform: rotate(-45deg);
}

.lines {
  position: absolute;
  border-radius:50%;
  border: 3px solid #333;
  width:70px;
  height:70px;
  left:-20px;
  top:-20px;
}

.lines:before {
  content:"";
  position: absolute; 
  border-radius:50%;
  border: 3px solid #333;
  width:70px;
  height:70px;
  top:65px;
  left:60px;
}

.shadow {
  position: absolute;
  width:100px;
  height:15px;
  background-color: rgba(0,0,0,0.2);
  border-radius:50%;
  top:95px;
  z-index:-1;
  left:3px;
  animation: scale 1.5s ease-in infinite;
}

@keyframes scale {
  0% {transform: scaleX(1);}
  25% {transform: scaleX(0.7);}
  50% {transform: scaleX(1);}
  75% {transform: scaleX(0.7);}
  100% {transform: scaleX(1);}
}

</style>