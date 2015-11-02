# react-validators
Enhanced React Shape PropType Validators


### Installation

```bash
npm i react-validators
```


### Purpose

React provides several useful proptype validators in order to ensure data being passed into
components as props match their expected type.

One common pattern is to have data-driven domain/model objects (for example, a "User") be passed 
around to several different components that utilize this object in different ways. It's also 
common for servers to not always return the full object shape for performance reasons. This can 
lead to uncertainty about whether or not a given component has all of the data it needs.
 
Unfortunately, react's `PropTypes.shape` validator can fall a bit short here. Components can have
varied requirements for a given shape's properties, and leads to rewriting the shape declaration
in multiple places.  

Furthermore, the data requirements of a given component should be defined in the file of that 
component alone, and not redeclared in all of the components consuming that component.



### Example Usage

```js
import { Shape, Types } from 'react-validators';

export default Shape({
  id: Types.number,
  first_name: Types.string,
  last_name: Types.string,
  profile_url: Types.string, 
  pic: { // you can nest objects properties
    url: Types.string,
    width: Types.number,
    height: Types.number,
  },
});
```


```jsx
import UserShape from '../shapes/UserShape';
import UserCard from './UserCard';
import UserBadge from './UserBadge';

export default class User extends React.Component {
  static defaultProps = {
    user: UserShape.requires(`
        first_name,
        last_name,
      `) // the needs of *this* component
      .passedTo(UserCard, 'user') // merges in the needs of UserCard
      .passedTo(UserBadge, 'user') // merges in the needs of UserBadge
      .isRequired,
  }
  render() {
    const { user } = this.props;
    return (
      <div>
        <div>{user.first_name} {user.last_name}</div>
        <UserCard user={user} />
        <UserBadge user={user} />
      </div>
    );
  }
}
```

```jsx
import UserShape from './UserShape';

export default class UserBadge extends React.Component {
  static defaultProps = {
    user: UserShape.requires(`
      profile_url,
      pic: {
        url,
        width,
        height,
      },
    `).isRequired,
  }
  render() {
    const { user } = this.props;
    return (
      <a href={user.profile_url}>
        <img src={user.pic.url} width={user.pic.width} height={user.pic.height} />
      </a>
    )
  }
}
```


```jsx
import UserShape from './UserShape';

export default class UserCard extends React.Component {
  static defaultProps = {
    user: UserShape.requires(`
      id,
      first_name,
      last_name,
      profile_url,
    `).isRequired
  }
  render() {
    const { user } = this.props;
    return (
      <a href={user.profile_url}>
        {user.first_name} {user.last_name} ({user.id})
      </a>
    )
  }
}
```
