import React from 'react';
import styled from 'styled-components';
import * as _ from 'lodash';
import { useParams, Link, Redirect } from 'react-router-dom';

import { useGameClient } from '../../utils/client';
import { Button } from '../../utils/style';
import { Board } from '../Board';
import { ControlsModal } from '../ControlsModal';
import { InviteModal } from '../InviteModal';
import { RenderItem } from '../../types';

import { Hand } from '../Hand';
import { DeckModal } from '../DeckModal';
import { RenameModal } from '../RenameModal';
import { ProgressBar } from '../ProgressBar';
import { facts } from '../../utils/facts';

const MainContainer = styled.div({
  height: '100%',
});

const AppContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  height: '100%',

  // Light Gray
  backgroundColor: '#dbdfe5',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23bdc5ca' fill-opacity='0.50' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
});

const BoardContainer = styled.div({ flex: 1 });

const PlayerContainer = styled.div({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: '505px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fafafa',
});

const PlayerLinksContainer = styled.div({
  padding: '1rem',
  '> button:nth-child(n+2)': {
    marginLeft: '1rem',
  },
});

const HandContainer = styled.div({
  flex: 1,
  display: 'flex',
  position: 'relative',
});

const LoadingPage = styled.div({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: '#fff',
  padding: '5rem',
});

const LoadingContainer = styled.div({
  margin: '0 auto',
  maxWidth: '600px',
});

const LoadingFact = styled.h3({
  margin: '1rem 0',
  fontSize: '2rem',
});

const LoadingFactSubheader = styled.h4({
  margin: '0 0 2rem',
  fontSize: '1.5rem',
});

const FailedConnection = styled.h4({
  fontSize: '3rem',
  color: '#e74c3c',
});

export const App: React.FC = () => {
  const { gameId = '' } = useParams();
  const {
    playerId,
    conn,
    board,
    myHand,
    assets,
    percentLoaded,
    handCounts,
    setBoard,
    failedConnection,
  } = useGameClient(gameId);
  const fact = React.useMemo(() => _.sample(facts), []);
  const [drawModalId, setDrawModalId] = React.useState<string>('');
  const [showRenameModal, setShowRenameModal] = React.useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = React.useState<boolean>(false);
  const [showControlsModal, setShowControlsModal] = React.useState<boolean>(
    false
  );

  const handleMoveItem = (id: string, x: number, y: number) => {
    if (!conn) {
      return;
    }
    setBoard((b: RenderItem[]) => {
      const index = b.findIndex(item => item.id === id);
      const boardCopy = [...b];
      if (index > -1) {
        boardCopy.splice(index, 1, {
          ...boardCopy[index],
          x,
          y,
          delta: boardCopy[index].delta + 1,
        });
      }
      return boardCopy;
    });
    conn.send({
      event: 'update_item',
      item: {
        id,
        x,
        y,
        delta: (board.find(item => item.id === id)?.delta || 0) + 1,
      },
    });
  };

  const handlePickUpCard = (id: string) => {
    if (conn) {
      conn.send({
        event: 'pick_up_cards',
        cardIds: [id],
      });
    }
  };

  const handleRename = (name: string) => {
    if (conn) {
      conn.send({
        name,
        event: 'rename_player',
      });
      setShowRenameModal(false);
    }
  };

  const handlePlayCards = (cardIds: string[]) => {
    if (!conn) {
      return;
    }
    conn.send({
      cardIds,
      event: 'play_cards',
    });
  };

  const handleDeckModal = (id: string) => {
    setDrawModalId(id);
  };

  const handleDrawCards = (count: number) => {
    if (!conn) {
      return;
    }
    conn.send({
      event: 'draw_cards',
      deckId: drawModalId,
      count,
    });
    setDrawModalId('');
  };

  const handleDiscard = (cardIds: string[]) => {
    if (conn) {
      conn.send({
        cardIds,
        event: 'discard',
      });
    }
  };

  const handleShuffleDiscarded = (deckId: string) => {
    if (conn) {
      conn.send({
        deckId,
        event: 'shuffle_discarded',
      });
    }
  };

  const handleDiscardPlayed = (id: string) => {
    if (conn) {
      conn.send({
        event: 'discard_played',
        deckId: id,
      });
    }
  };

  const handlePromptRename = () => {
    setShowRenameModal(true);
  };

  const player = board.find(item => item.id === playerId);
  const boardContainerRef = React.useRef() as React.MutableRefObject<
    HTMLInputElement
  >;

  if (!gameId) {
    return <Redirect to="/" />;
  }

  return (
    <MainContainer>
      <AppContainer>
        <BoardContainer ref={boardContainerRef}>
          <Board
            assets={assets}
            board={board}
            onMoveItem={handleMoveItem}
            onPickUpCard={handlePickUpCard}
            onDeckPrompt={handleDeckModal}
            onRename={handleRename}
            container={boardContainerRef}
            handCounts={handCounts}
            onShuffleDiscarded={handleShuffleDiscarded}
            onDiscardPlayed={handleDiscardPlayed}
          />
        </BoardContainer>
        <PlayerContainer>
          {player && (
            <h1
              style={{
                margin: 0,
                padding: 10,
                background: player.fill,
                color: '#fff',
                cursor: 'pointer',
              }}
              onClick={handlePromptRename}
            >
              {player.name}
            </h1>
          )}
          <HandContainer>
            <Hand
              assets={assets}
              hand={myHand}
              playCards={handlePlayCards}
              discard={handleDiscard}
            />
          </HandContainer>
          <PlayerLinksContainer>
            <Button design="primary" onClick={() => setShowControlsModal(true)}>
              Controls
            </Button>
            <Button design="primary" onClick={() => setShowInviteModal(true)}>
              Invite
            </Button>

            <Link to="/" className="u-pull-right">
              <Button design="danger">Leave Game</Button>
            </Link>
          </PlayerLinksContainer>
        </PlayerContainer>
        {drawModalId && (
          <DeckModal
            onDrawCards={handleDrawCards}
            onClose={() => setDrawModalId('')}
          />
        )}
        {showRenameModal && (
          <RenameModal
            onSave={handleRename}
            onClose={() => setShowRenameModal(false)}
          />
        )}
        {showControlsModal && (
          <ControlsModal onClose={() => setShowControlsModal(false)} />
        )}
        {showInviteModal && (
          <InviteModal
            gameId={gameId}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </AppContainer>
      {_.size(assets) === 0 && (
        <LoadingPage>
          <LoadingContainer>
            {failedConnection ? (
              <FailedConnection>Connection Failed</FailedConnection>
            ) : (
              <>
                <ProgressBar complete={percentLoaded} />
                <LoadingFact>{fact}</LoadingFact>
                <LoadingFactSubheader>
                  - Loading Screen Facts
                </LoadingFactSubheader>
              </>
            )}
            <Link to="/">Leave Game</Link>
          </LoadingContainer>
        </LoadingPage>
      )}
    </MainContainer>
  );
};
