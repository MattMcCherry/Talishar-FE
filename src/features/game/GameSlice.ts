import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import ParseGameState from '../../app/ParseGameState';
import InitialGameState from './InitialGameState';
import GameInfo from '../GameInfo';
import { Card } from '../Card';
import {
  API_URL_BETA,
  API_URL_LIVE,
  API_URL_DEV,
  GAME_LIMIT_LIVE,
  GAME_LIMIT_BETA
} from 'constants';
import Button from '../Button';
import GameState from '../GameState';
import { FaSignal } from 'react-icons/fa';

export const nextTurn = createAsyncThunk(
  'game/nextTurn',
  async (
    params: { game: GameInfo; signal: AbortSignal | undefined },
    { getState }
  ) => {
    const queryURL =
      params.game.gameID > GAME_LIMIT_LIVE
        ? `${API_URL_LIVE}GetNextTurn3.php?`
        : params.game.gameID > GAME_LIMIT_BETA
        ? `${API_URL_BETA}GetNextTurn3.php?`
        : `${API_URL_DEV}GetNextTurn3.php?`;
    const queryParams = new URLSearchParams({
      gameName: String(params.game.gameID),
      playerID: String(params.game.playerID),
      authKey: String(params.game.authKey),
      lastUpdate: String(params.game.lastUpdate)
    });

    let waitingForJSONResponse = true;
    while (waitingForJSONResponse) {
      try {
        const response = await fetch(queryURL + queryParams, {
          method: 'GET',
          headers: {},
          credentials: 'include',
          signal: params.signal
        });
        let data = await response.text();
        if (data.toString().trim() === '0') {
          continue;
        }
        waitingForJSONResponse = false;
        data = data.toString().trim();
        const indexOfBraces = data.indexOf('{');
        if (indexOfBraces !== 0) {
          console.log(data.substring(0, indexOfBraces));
          data = data.substring(indexOfBraces);
        }
        const parsedData = JSON.parse(data);
        const gs = ParseGameState(parsedData);
        return gs;
      } catch (e) {
        if (params.signal?.aborted) {
          return console.log('fetch aborted');
        }
        waitingForJSONResponse = false;
        console.log(e);
        return console.error(e);
      }
    }
  }
);

export const playCard = createAsyncThunk(
  'game/playCard',
  async (params: { cardParams: Card; cardIndex?: number }, { getState }) => {
    const { game } = getState() as { game: GameState };
    // if (game.isPlayerInputInProgress) {
    //   return;
    // }

    const playNo =
      params.cardParams.actionDataOverride != ''
        ? params.cardParams.actionDataOverride
        : params.cardIndex;
    const gameInfo = game.gameInfo;

    const queryURL =
      gameInfo.gameID > GAME_LIMIT_LIVE
        ? `${API_URL_LIVE}ProcessInput2.php?`
        : gameInfo.gameID > GAME_LIMIT_BETA
        ? `${API_URL_BETA}ProcessInput2.php?`
        : `${API_URL_DEV}ProcessInput2.php?`;
    const queryParams = new URLSearchParams({
      gameName: String(gameInfo.gameID),
      playerID: String(gameInfo.playerID),
      authKey: String(gameInfo.authKey),
      mode: String(params.cardParams.action),
      cardID: String(playNo)
    });

    try {
      const response = await fetch(queryURL + queryParams, {
        method: 'GET',
        headers: {},
        credentials: 'include'
      });
      const data = await response.text();
      return;
    } catch (e) {
      console.error(e);
    }
  }
);

export const submitButton = createAsyncThunk(
  'game/submitButton',
  async (params: { button: Button }, { getState }) => {
    const { game } = getState() as { game: GameState };
    const queryURL =
      game.gameInfo.gameID > GAME_LIMIT_LIVE
        ? `${API_URL_LIVE}ProcessInput2.php?`
        : game.gameInfo.gameID > GAME_LIMIT_BETA
        ? `${API_URL_BETA}ProcessInput2.php?`
        : `${API_URL_DEV}ProcessInput2.php?`;
    const queryParams = new URLSearchParams({
      gameName: String(game.gameInfo.gameID),
      playerID: String(game.gameInfo.playerID),
      authKey: String(game.gameInfo.authKey),
      mode: String(params.button.mode),
      buttonInput: String(params.button.buttonInput)
    });
    try {
      const response = await fetch(queryURL + queryParams, {
        method: 'GET',
        headers: {},
        credentials: 'include'
      });
      const data = await response.text();
      return;
    } catch (e) {
      console.error(e);
    }
  }
);

export const submitMultiButton = createAsyncThunk(
  'game/submitButton',
  async (params: { mode?: number; extraParams: string }, { getState }) => {
    const { game } = getState() as { game: GameState };
    const queryURL =
      game.gameInfo.gameID > GAME_LIMIT_LIVE
        ? `${API_URL_LIVE}ProcessInput2.php?`
        : game.gameInfo.gameID > GAME_LIMIT_BETA
        ? `${API_URL_BETA}ProcessInput2.php?`
        : `${API_URL_DEV}ProcessInput2.php?`;
    const queryParams = new URLSearchParams({
      gameName: String(game.gameInfo.gameID),
      playerID: String(game.gameInfo.playerID),
      authKey: String(game.gameInfo.authKey),
      mode: String(params.mode)
    });
    const queryParamsString =
      queryURL + queryParams.toString() + params.extraParams;
    try {
      const response = await fetch(queryParamsString, {
        method: 'GET',
        headers: {},
        credentials: 'include'
      });
      const data = await response.text();
      return;
    } catch (e) {
      console.error(e);
    }
  }
);

export const gameSlice = createSlice({
  name: 'game',
  initialState: InitialGameState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setPopUp: (
      state,
      action: PayloadAction<{
        cardNumber: string;
        xCoord?: number;
        yCoord?: number;
      }>
    ) => {
      state.popup = {
        popupOn: true,
        xCoord: action.payload.xCoord,
        yCoord: action.payload.yCoord,
        popupCard: { cardNumber: action.payload.cardNumber }
      };
    },
    clearPopUp: (state) => {
      state.popup = { popupOn: false, popupCard: undefined };
    },
    setPlayCardMessage: (state) => {
      state.playCardMessage = {
        popUpOn: true,
        message: 'Release to play this card'
      };
    },
    clearPlayCardMessage: (state) => {
      state.playCardMessage = { popUpOn: false };
    },
    setCardListFocus: (
      state,
      action: PayloadAction<{
        cardList?: Card[];
        name?: string;
      }>
    ) => {
      state.cardListFocus = {
        active: true,
        cardList: action.payload.cardList,
        name: action.payload.name,
        apiCall: false
      };
    },
    setCardListLoadFocus: (
      state,
      action: PayloadAction<{
        name?: string;
        query?: string;
      }>
    ) => {
      state.cardListFocus = {
        active: true,
        name: action.payload.name,
        apiQuery: action.payload.query,
        apiCall: true
      };
    },
    clearCardListFocus: (state) => {
      state.cardListFocus = undefined;
    },
    openOptionsMenu: (state) => {
      state.optionsMenu = { active: true };
    },
    closeOptionsMenu: (state) => {
      state.optionsMenu = { active: false };
    },
    setGameStart: (
      state,
      action: PayloadAction<{
        playerID: number;
        gameID: number;
        authKey: string;
      }>
    ) => {
      (state.gameInfo.gameID = action.payload.gameID),
        (state.gameInfo.playerID = action.payload.playerID),
        (state.gameInfo.authKey = action.payload.authKey),
        (state.gameInfo.lastUpdate = 0),
        (state.playerOne = {}),
        (state.playerTwo = {});
      state.activeLayers = undefined;
      state.activeChainLink = undefined;
    },
    removeCardFromHand: (state, action: PayloadAction<{ card: Card }>) => {
      state.playerOne.Hand = state.playerOne?.Hand?.filter(
        (cardObj) =>
          cardObj.actionDataOverride != action.payload.card.actionDataOverride
      );
    },
    showChainLinkSummary: (
      state,
      action: PayloadAction<{ chainLink?: number }>
    ) => {
      state.chainLinkSummary = {
        show: true,
        index: action?.payload.chainLink ?? -1
      };
    },
    hideChainLinkSummary: (state) => {
      state.chainLinkSummary = {};
    },
    setIsUpdateInProgressFalse: (state) => {
      state.isUpdateInProgress = false;
    },
    hideActiveLayer: (state) => {
      state.activeLayers = { ...state.activeLayers, active: false };
    },
    showActiveLayer: (state) => {
      state.activeLayers = { ...state.activeLayers, active: true };
    }
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    // nextTurn
    builder.addCase(nextTurn.fulfilled, (state, action) => {
      if (action.payload === undefined) {
        return state;
      }
      state.isUpdateInProgress = false;
      state.isPlayerInputInProgress = false;

      state.playerOne = { ...state.playerOne, ...action.payload.playerOne };
      state.playerTwo = { ...state.playerTwo, ...action.payload.playerTwo };
      state.activeChainLink = action.payload.activeChainLink;
      state.activeLayers = action.payload.activeLayers;
      state.oldCombatChain = action.payload.oldCombatChain;
      state.chatLog = action.payload.chatLog;
      state.activePlayer = action.payload.activePlayer;
      state.turnPhase = action.payload.turnPhase;
      state.playerInputPopUp = action.payload.playerInputPopUp;

      // gameInfo
      state.gameInfo.lastPlayed = action.payload.gameInfo.lastPlayed;
      state.gameInfo.lastUpdate = action.payload.gameInfo.lastUpdate;
      state.gameInfo.turnNo = action.payload.gameInfo.turnNo;

      state.playerPrompt = action.payload.playerPrompt;
      state.canPassPhase = action.payload.canPassPhase;
      state.events = action.payload.events;

      return state;
    });
    builder.addCase(nextTurn.pending, (state, action) => {
      state.isUpdateInProgress = true;
      return state;
    });
    builder.addCase(nextTurn.rejected, (state, action) => {
      state.isUpdateInProgress = false;
      return state;
    });

    // playCard
    builder.addCase(playCard.pending, (state) => {
      // player input in progress
      state.isPlayerInputInProgress = true;
      return state;
    });
    builder.addCase(playCard.fulfilled, () => {
      // not setting isPlayerInput to false because the
      // 'nextTurn' builder will set to true.
      return;
    });
    builder.addCase(playCard.rejected, (state) => {
      state.isPlayerInputInProgress = false;
      return state;
    });

    // submitButton
    builder.addCase(submitButton.pending, (state) => {
      // player input in progress
      state.isPlayerInputInProgress = true;
      return state;
    });
    builder.addCase(submitButton.fulfilled, () => {
      return;
    });
    builder.addCase(submitButton.rejected, (state) => {
      state.isPlayerInputInProgress = false;
      return state;
    });
  }
});

// export const {} = gameSlice.actions;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

export default gameSlice.reducer;

const { actions } = gameSlice;
export const {
  setPopUp,
  setGameStart,
  clearPopUp,
  setCardListFocus,
  setCardListLoadFocus,
  clearCardListFocus,
  removeCardFromHand,
  openOptionsMenu,
  closeOptionsMenu,
  showChainLinkSummary,
  hideChainLinkSummary,
  hideActiveLayer,
  showActiveLayer,
  setIsUpdateInProgressFalse
} = actions;
