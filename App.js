import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const {
  set,
  cond,
  eq,
  spring,
  startClock,
  stopClock,
  clockRunning,
  defined,
  Value,
  Clock,
  event
} = Animated;

function runSpring(clock, value, velocity, dest) {
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0)
  };

  const config = {
    damping: 7,
    mass: 1,
    stiffness: 121.6,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
    toValue: new Value(0)
  };

  return [
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.velocity, velocity),
      set(state.position, value),
      set(config.toValue, dest),
      startClock(clock)
    ]),
    spring(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position
  ];
}
export default class App extends React.Component {
  constructor() {
    super();
    this.translateX = new Value(0);
    const dragX = new Value(0);
    const state = new Value(-1);
    const dragVX = new Value(0);

    this.onGestureEvent = event([
      {
        nativeEvent: {
          translationX: dragX,
          velocityX: dragVX,
          state: state
        }
      }
    ]);

    const clock = new Clock();
    const transX = new Value();
    this.translateX = cond(
      eq(state, State.ACTIVE),
      [
        //state active,
        stopClock(clock),
        set(transX, dragX),
        transX
      ],
      [
        set(
          transX,
          cond(defined(transX), runSpring(clock, transX, dragVX, 0), 0)
        )
      ]
    );
  }
  componentDidMount() {
    // setInterval(() => {
    //   for (i = 0; i < 5000; i++) {
    //     console.log('blocking thread');
    //   }
    // }, 1000);
  }
  render() {
    return (
      <View style={styles.container}>
        <PanGestureHandler
          onGestureEvent={this.onGestureEvent}
          onHandlerStateChange={this.onGestureEvent}
        >
          <Animated.View
            style={[
              styles.box,
              {
                transform: [{ translateX: this.translateX }]
              }
            ]}
          />
        </PanGestureHandler>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  box: {
    height: 100,
    width: 100,
    backgroundColor: 'red'
  }
});
