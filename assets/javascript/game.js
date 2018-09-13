var game = {
  currentIndex: 0,
  playerAnswers: [],
  quizResults: [],

  shuffle : function(array) {
    var i = 0
      , j = 0
      , temp = null
  
    for (i = array.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1))
      temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }

    return array;
  },  
}; //end game object


//  Variable that will hold our setInterval that runs the countdown clock
var intervalId;

// prevents the clock from being sped up unnecessarily
var clockRunning = false;
var time = 10;


//$(document).ready(function() {
  $(function() {

    // Set number of questions to use in the trivia game
    var numQuestions = 4;

    /* The search Trivia Database function takes the number of questions as an argument,
       searches the tbd api, and then uses the information to populate the game object.*/
       function search_tdb(intIn) {
          var queryURL = "https://opentdb.com/api.php?amount=" + intIn + "&category=16";
          $.ajax({
            url: queryURL,
            method: "GET"
          }).then(function(response) {

              var data = response;

              game.questions = data;

          // console.log(game.questions);  
          // console.log(game.questions.results.length);
          // console.log(game.questions.results[0].incorrect_answers);
          // console.log(game.questions.results[0].correct_answer);


            //add a new array for game choices that combines the correct and incorrect answers
            for (var i=0; i<game.questions.results.length; i++) {
              game.questions.results[i].choices = game.questions.results[i].incorrect_answers;
              game.questions.results[i].choices[game.questions.results[i].choices.length] = game.questions.results[i].correct_answer;
    //          console.log("The Length: "+game.questions.results[i].choices.length);
              //shuffle choices to create random
              game.shuffle(game.questions.results[i].choices);
            }


            loadQuestion(game.currentIndex);
          });

      };

    //when the page loads the first time:

    //set/reset wait variable
    var wait = "";

    //hide the entire form's fieldset
    elementToggle("#qfield","d-none", "hide");

    //Create Start Button
    var str = '<a href="#" id="restart" class="button restart">Start<span><svg><use xlink:href="#arrow" href="#arrow"></use></svg></span></div>'
    $("#btnRestart").append(str);

    //show the start button and on click of start button load the questions.  This is preventing flicker
    //show or hide the elements of the fieldset as needed
    elementToggle(".display","d-none", "hide");
    elementToggle(".btnRestart","d-none", "show");
    elementToggle(".btnContainer","d-none", "hide");
    elementToggle(".legend","d-none", "hide");
    elementToggle(".question","d-none", "hide");
    elementToggle(".choices","d-none", "hide");
    elementToggle(".answer","d-none", "hide");
    elementToggle(".results","d-none", "hide");
    //show the form's fieldset
    elementToggle("#qfield","d-none", "show");

    function loadQuestion(indexIn) {
      elementToggle("#qfield","d-none", "hide");

      console.log(indexIn);
      clearTimeout(wait);  //clear the timeout
      stop(); //clear interval
      var i=indexIn;
      //zero based index, but display human based index
      var q=indexIn + 1;

      //clear previous question:
      clear("legend");
      clear("question");
      clear("choices");
      clear("answer");
      clear("results");

      //construct HTML Legend & append
      str = "Question #" + q + ": ";    
      $("#legend").append(str);

      //construct HTML question String & append
      console.log(game.questions.results[i].question);
      str = game.questions.results[i].question;    
      $("#question").append(str);

      //construct HTML answer Strings & append
      //loop through each answer choice
      for (var j = 0; j < game.questions.results[i].choices.length; j++)
      {
        choice = game.questions.results[i].choices[j];
        str = '<div><input type="radio" id="choice-'+j+'" name="choice" value="'+choice+'" /><label for="choice-'+j+'">&nbsp;'+choice+'</label></div>';
        $("#choices").append(str);
      }

      //show the start button and on click of start button load the questions
      elementToggle(".display","d-none", "show");
      elementToggle(".btnRestart","d-none", "hide");
      elementToggle(".btnContainer","d-none", "show");
      elementToggle(".legend","d-none", "show");
      elementToggle(".question","d-none", "show");
      elementToggle(".choices","d-none", "show");
      elementToggle(".answer","d-none", "hide");
      elementToggle(".results","d-none", "hide");

      elementToggle("#qfield","d-none", "show");

      //start countdown
      clockRunning = false;
      time = 10;
      resetClock();

    }; //end load question function

    function displayAnswer(str) {
      //hide form's submit button
      elementToggle(".btnContainer", "d-none", "hide");
      //hide the clock
      elementToggle(".display", "d-none", "hide");
      $("#answer").append(str);
    }

    //clear question
    function clear(strIn){
      var list = document.getElementById(strIn);
      while (list.hasChildNodes()) {   
          list.removeChild(list.firstChild);
      }
    }; //end clear question function

    function getRadioCheckedValue(radio_name) {
      var oRadio = document.forms[0].elements[radio_name];
      for(var i = 0; i < oRadio.length; i++) {
        if(oRadio[i].checked) {
          return oRadio[i].value;
        }
      }
      return 'Not Answered';
    }    

    function revealAnswer(source) {
      //get player's answer
      playerAnswer = (getRadioCheckedValue("choice"));
      game.playerAnswers.push(playerAnswer);

      //clear previous question:
      clear("choices");

      //test player's answer to see if it is correct or incorrect & Display
      if(source==="click") {
        if(game.questions.results[game.currentIndex].correct_answer === playerAnswer){
          str = "Good Job! Your answer, "+ playerAnswer + ", is correct";
          game.quizResults.push("Correct");
                
        } else {
          str = "The correct answer is "+ game.questions.results[game.currentIndex].correct_answer + ".<br> Your Answer: " + playerAnswer;
          if (playerAnswer === 'Not Answered') {
            game.quizResults.push("Unanswered");
          } else {
            game.quizResults.push("Incorrect");
          }
        }
      } else {
        str = "It appears you aren't playing the game.  You must try harder."
        game.quizResults.push("Unanswered");
      }
      displayAnswer(str); 

      //don't allow click to increment higher than length of triva question list
      if(game.currentIndex<game.questions.results.length-1) {
        //increment currentIndex
        game.currentIndex +=1;

        //load next question (but wait 5 seconds)--runs only 1x
        wait = setTimeout(loadQuestion, 5000, game.currentIndex);

      } else {
        wait = setTimeout(loadResult, 5000);
      }
    }; //end revealAnswer


    function loadResult() {
      clearTimeout(wait);  //clear the timeout
      stop(); //clear interval

      elementToggle(".btnRestart","d-none", "show");
      elementToggle(".btnContainer","d-none", "hide");

      //clear previous question:
      clear("legend");
      clear("question");
      clear("choices");
      clear("answer");
      //clear("result");

      //construct HTML Legend & append
      str = "Quiz Results: ";    
      $("#legend").append(str);
      $("#results").append(countResults());
      
    }; //end results function


    function countResults() {
      result="";
      array_elements = game.quizResults; 
      array_elements.sort();
  
      var current = null;
      var cnt = 0;
      var str = "";
      for (var i = 0; i < array_elements.length; i++) {
          if (array_elements[i] != current) {
              if (cnt > 0) {
                if (current != "Unanswered") {
                  str = ' Answers: ';
                } else {
                  str = ': ';
                }
                  result = result + (current + str + cnt + '<br>');
              }
              current = array_elements[i];
              if (current != "Unanswered") {
                str = ' Answers: ';
              } else {
                str = ': ';
              }
            cnt = 1;
          } else {
              cnt++;
          }
      }
      if (cnt > 0) {
        if (current != "Unanswered") {
          str = ' Answers: ';
        } else {
          str = ': ';
        }
        result = result + (current + str + cnt);
      }
      return result;
  
  }


    //create on-click listener for the submit button
    $("#submit").on("click",function() {
      stop();
      revealAnswer("click");
    }); //end on-click button 

    //create on-click listener for the start / restart button
    $("#btnRestart").on("click",".restart",function() {
      //console.log("Restart Button Clicked");
      //create the trivia list of questions and answers
      
      // Search the API for the a specific number of questions, and populate the game object
      search_tdb(numQuestions);

      //change the value of the button to 'Restart'
      //hide the restart button
      elementToggle("#btnRestart","d-none", "hide");
      clear("btnRestart");
      var str = '<a href="#" id="restart" class="button restart">Restart<span><svg><use xlink:href="#arrow" href="#arrow"></use></svg></span></div>'
      $("#btnRestart").append(str);

      //clear the values of the quiz results and player answers at the start of the game and reset the current index back to zero.
      game.currentIndex = 0;
      game.quizResults = [];
      game.playerAnswers = [];

    }); //end restart button 

        /*
    Adding and removing a class to show or hide a element, usually a div.  
    In this application, the only class that uses this function is d-none (a bootstrap class), 
    but the function is generic so could be used elsewhere.
    */
    function elementToggle(elementIn, classIn, actionIn) {
      if (actionIn === "hide") {
          $(elementIn).addClass(classIn);
      } else if (actionIn === "show") {
          $(elementIn).removeClass(classIn);
      }
    };



    /*countdown clock*/
/*
|---------------------------|
|   __  o __  __    _       |
|    _)   __)  /   |_)|V|   |
|   /__ o __) /    |  | |   |
|---------------------------|
*/

function resetClock() {
  clockRunning = false;
  var time = time;
  $("#display").text("Time Left: 00:10");
  start();
} 

function start() {
  if (!clockRunning) {
    intervalId = setInterval(count, 1000);
    clockRunning = true;
  }
}

function stop() {
  clearInterval(intervalId);
  clockRunning = false;
}

/*웃*/
function count() {
  time--;
  if (time<0) {
    stop();
    revealAnswer("timeout");
  } else {
    var converted = "Time Left: " + timeConverter(time);
    $("#display").text(converted);
  }
} //end count

function timeConverter(t) {

  var minutes = Math.floor(t / 60);
  var seconds = t - (minutes * 60);

  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  if (minutes === 0) {
    minutes = "00";
  }
  else if (minutes < 10) {
    minutes = "0" + minutes;
  }

  return minutes + ":" + seconds;
}




  }); //end document ready function


