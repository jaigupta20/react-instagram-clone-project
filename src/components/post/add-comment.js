import { useState, useContext } from 'react';
import Picker from 'emoji-picker-react';
import PropTypes from 'prop-types';
import FirebaseContext from '../../context/firebase';
import UserContext from '../../context/user';

export default function AddComment({
  docId,
  comments,
  setComments,
  commentInput,
}) {
  const [comment, setComment] = useState('');
  const [isEmojiChosen, setIsEmojiChosen] = useState(false);

  const { firebase, FieldValue } = useContext(FirebaseContext);
  const {
    user: { displayName },
  } = useContext(UserContext);

  const handleSubmitComment = (event) => {
    event.preventDefault();

    setComments([...comments, { displayName, comment }]);
    setComment('');
    // give me a new array []
    // put the new comment in there
    // add the old comments
    // then we have a new array with the new comment and the older comments

    return firebase
      .firestore()
      .collection('photos')
      .doc(docId)
      .update({
        comments: FieldValue.arrayUnion({ displayName, comment }),
      });
  };

  const onEmojiClick = (event, emojiObject) => {
    setComment((prevText) => prevText + emojiObject.emoji);
  };

  return (
    <div className='border-t border-gray-primary'>
      <form
        method='POST'
        className='flex justify-between pl-0 pr-5'
        onSubmit={(event) =>
          comment.length > 1
            ? handleSubmitComment(event)
            : event.preventDefault()
        }
      >
        <div className='relative'>
          <input
            type='text'
            aria-label='Add a Comment'
            autoComplete='off'
            className='text-sm text-gray-base w-full mr-3 py-5 px-4 focus:outline-none ml-8'
            name='add-comment'
            placeholder='Add a comment...'
            value={comment}
            onChange={({ target }) => setComment(target.value)}
            ref={commentInput}
          />
          <svg
            aria-label='Emoji'
            className='top-4 left-3 absolute cursor-pointer'
            color='#262626'
            fill='#262626'
            height='24'
            role='img'
            viewBox='0 0 24 24'
            width='24'
            onClick={() => setIsEmojiChosen((isEmojiChosen) => !isEmojiChosen)}
          >
            <path d='M15.83 10.997a1.167 1.167 0 101.167 1.167 1.167 1.167 0 00-1.167-1.167zm-6.5 1.167a1.167 1.167 0 10-1.166 1.167 1.167 1.167 0 001.166-1.167zm5.163 3.24a3.406 3.406 0 01-4.982.007 1 1 0 10-1.557 1.256 5.397 5.397 0 008.09 0 1 1 0 00-1.55-1.263zM12 .503a11.5 11.5 0 1011.5 11.5A11.513 11.513 0 0012 .503zm0 21a9.5 9.5 0 119.5-9.5 9.51 9.51 0 01-9.5 9.5z'></path>
          </svg>

          {isEmojiChosen && (
            <Picker
              pickerStyle={{ width: '100%', border: '2px solid #444' }}
              onEmojiClick={onEmojiClick}
            />
          )}
        </div>
        <button
          className={`text-sm font-bold text-blue-medium focus:outline-none ${
            !comment && 'opacity-25'
          }`}
          type='button'
          disabled={comment.length < 1}
          onClick={handleSubmitComment}
        >
          Post
        </button>
      </form>
    </div>
  );
}

AddComment.propTypes = {
  docId: PropTypes.string.isRequired,
  comments: PropTypes.array.isRequired,
  setComments: PropTypes.func.isRequired,
  commentInput: PropTypes.object.isRequired,
};
