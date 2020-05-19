import React from 'react';
import { Text, Image, Label, Tag } from 'react-konva';

import { useAsset } from './utils';
import { Assets } from '../../utils/game';
import { PieceTransformer, useTransformer } from './PieceTransformer';
import { DeckPiece } from '../../types';

interface Props {
  assets: Assets;
  piece: DeckPiece;
  isSelected?: boolean;
  onSelect?: () => void;
  onChange: (o: any) => void;
  onDblClick: () => void;
  onContextMenu?: (e: any) => void;
}

export function Deck(props: Props) {
  const {
    piece,
    onSelect,
    assets,
    isSelected,
    onChange,
    onDblClick,
    onContextMenu,
  } = props;
  const [isHolding, setIsHolding] = React.useState(false);
  const [checkForHolding, setCheckForHolding] = React.useState(false);
  const image = useAsset(assets, piece);
  const objectRef = React.useRef<any>();
  const handleTransform = useTransformer(objectRef, onChange);

  if (isHolding && checkForHolding && onContextMenu) {
    onContextMenu({
      evt: {
        clientX: 20,
        clientY: 20,
      },
    });
    setCheckForHolding(false);
  }

  return (
    <>
      <Label x={piece.x} y={piece.y - 40}>
        <Tag fill="#111" lineJoin="round" />
        <Text
          text={`${piece.count || 0} of ${piece.total || 0} cards remaining`}
          fontSize={22}
          padding={5}
          fill="white"
        />
      </Label>

      <Image
        id={piece.id}
        ref={objectRef}
        image={image}
        x={piece.x}
        y={piece.y}
        width={piece.width}
        height={piece.height}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={handleTransform}
        onDblClick={onDblClick}
        onDblTap={onDblClick}
        onTouchStart={() => {
          setCheckForHolding(false);
          setIsHolding(true);
          setTimeout(() => setCheckForHolding(true), 700);
        }}
        onTouchEnd={() => {
          setIsHolding(false);
        }}
        onContextMenu={e => {
          e.evt.preventDefault();

          if (onContextMenu) {
            onContextMenu(e);
          }
        }}
      />
      <PieceTransformer
        isSelected={isSelected || false}
        objectRef={objectRef}
      />
    </>
  );
}