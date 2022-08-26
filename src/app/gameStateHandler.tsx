import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { visitFunctionBody } from 'typescript';

const intervalLength = 2000;
// const hostURL = 'https://localhost/FaBOnline/';

export function GameStateHandler() {
  useEffect(() => {
    function getGameState() {
      const response = fetch(
        'http://localhost/FaBOnline/GetNextTurn3.php?gameName=659&playerID=3&authKey=28df413b665604299807c461a7f3cae71c4176cb2b96afad04b84cf96d016258',
        {
          method: 'GET',
          headers: {}
        }
      )
        .then((data) => data.text())
        .then((text) => console.log(text))
        .catch((err) => {
          console.log('ERROR!', err);
        });
      // The value we return becomes the `fulfilled` action payload
      console.log(response);
    }
    const intervalID = setInterval(getGameState, intervalLength);
    getGameState();
    return () => {
      clearInterval(intervalID);
    };
  }, []);

  return <></>;
}
