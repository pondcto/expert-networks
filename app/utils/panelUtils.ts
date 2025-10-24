import { PanelSizing } from "../types";

export function calculatePanelDimensions(
  containerWidth: number,
  containerHeight: number,
  sizing: PanelSizing
) {
  const topSectionHeight = Math.floor(containerHeight * (sizing.topHeight / 100));
  const bottomSectionHeight = containerHeight - topSectionHeight;
  
  const leftPanelWidth = Math.floor(containerWidth * (sizing.chatWidth / 100));
  const rightPanelWidth = containerWidth - leftPanelWidth;
  
  const activitiesWidth = Math.floor(leftPanelWidth * (sizing.activitiesWidth / 100));
  const sourcesWidth = Math.floor(leftPanelWidth * (sizing.sourcesWidth / 100));
  const teamMembersWidth = leftPanelWidth - activitiesWidth - sourcesWidth;
  
  return {
    topSection: {
      width: containerWidth,
      height: topSectionHeight
    },
    bottomSection: {
      width: containerWidth,
      height: bottomSectionHeight
    },
    leftPanel: {
      width: leftPanelWidth,
      height: bottomSectionHeight
    },
    rightPanel: {
      width: rightPanelWidth,
      height: bottomSectionHeight
    },
    activities: {
      width: activitiesWidth,
      height: topSectionHeight
    },
    sources: {
      width: sourcesWidth,
      height: topSectionHeight
    },
    teamMembers: {
      width: teamMembersWidth,
      height: topSectionHeight
    }
  };
}

export function constrainPanelSize(
  currentSize: number,
  delta: number,
  minSize: number = 200,
  maxSize: number = 800
): number {
  const newSize = currentSize + delta;
  return Math.max(minSize, Math.min(maxSize, newSize));
}

export function calculatePercentageSize(
  currentSize: number,
  totalSize: number
): number {
  return Math.round((currentSize / totalSize) * 100);
}
