import React, { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import GeneralUtil from '../../../util/general-util'

export type PlotDetails = {
  title: string,
  id: string,
  seriesLabel: string
}

export type PlotProps = {
  details: PlotDetails,
  data: number[][]
};
/**
 * @method
 * @description
 * Creates the width and height of our plot
 * @param width {boolean} whether this is the width or not
 * @return {number} size in pixels
**/
function createPlotWidthAndHeight(width: boolean): number {
  // Just a failsafe in case we are SSR'ed
  if (GeneralUtil.onServer()) {
    return 10;
  }
  // Calc vmin
  const vmin: number = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight);
  return width? 0.9 * vmin : 0.6 * vmin;
  
}
/**
 * @method
 * @description
 * Creates the uplot options for our app
 * @param input {PlotDetails} details inputted by other components
 * @param {}
 * @return {}
**/
function createPlotOptions(input: PlotDetails): uPlot.Options {
  return {
    title: input.title,
    id: input.id,
    width: createPlotWidthAndHeight(true),
    height: createPlotWidthAndHeight(false),
    series: [
      {},
      {
        // initial toggled state (optional)
        show: true,
        spanGaps: false,
        // in-legend display
        label: input.seriesLabel,
        value: (self, rawValue) => rawValue.toFixed(0),
      
        // series style
        stroke: 'white',
        width: 1,
        fill: "rgba(230, 230, 230, 0.3)",
        dash: [10, 5],
      }
    ],
    axes: [
      {
        stroke: 'white',
        label: 'first spot'
      },
      {
        stroke: 'white',
        label: 'second spot'
      }
    ]
  }
}

const PlotComponent = (props: PlotProps) => {
  const plotRef = useRef();
  
  useEffect(() => {
    // First we need to check if we have any other child components attached and remove them
    /*@ts-ignore*/
    if (plotRef.current?.children?.length > 0) {
      /*@ts-ignore*/
      for (let child of plotRef.current.children) {
        /*@ts-ignore*/
        plotRef.current.removeChild(child);
      }
    }
    // Then we can add a new child plot element
    /*@ts-ignore*/
    new uPlot(createPlotOptions(props.details), props.data, plotRef.current);
  }, [props]);
  return (
    <div>
      <div ref={plotRef} />
    </div>
  );
}

export default PlotComponent;
