// Actions
const INCREMENT = "redux/counter/INCREMENT";
const DECREMENT = "redux/counter/DECREMENT";

// Reducer
const counter = (state = 1, action) => {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    case DECREMENT:
      return state - 1;
    default:
      return state;
  }
};

export default counter;

// Action Creators
const increment = () => ({
  type: INCREMENT,
});

const decrement = () => ({
  type: DECREMENT,
});

export const actions = {
  increment,
  decrement,
};
