import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import useUser from '../../hooks/use-user';
import { DEFAULT_IMAGE_PATH } from '../../constants/paths';
import { isUserFollowingProfile, toggleFollow } from '../../services/firebase';
import UserContext from '../../context/user';

export default function Header({
  photosCount,
  followerCount,
  setFollowerCount,
  profile: {
    docId: profileDocId,
    userId: profileUserId,
    fullName,
    followers,
    following,
    username: profileUsername,
  },
}) {
  const { user: loggedInUser } = useContext(UserContext);
  const { user } = useUser(loggedInUser?.uid);
  const [isFollowingProfile, setIsFollowingProfile] = useState(null);
  const activeBtnFollow = user?.username && user?.username !== profileUsername;

  const handleToggleFollow = async () => {
    setIsFollowingProfile((isFollowingProfile) => !isFollowingProfile);
    setFollowerCount({
      followerCount: isFollowingProfile ? followerCount - 1 : followerCount + 1,
    });
    await toggleFollow(
      isFollowingProfile,
      user.docId,
      profileDocId,
      profileUserId,
      user.userId
    );
  };

  useEffect(() => {
    const isLoggedInUserFollowingProfile = async () => {
      const isFollowing = await isUserFollowingProfile(
        user.username,
        profileUserId
      );
      // in the below line the two exclamations are used to turn the value to boolean and it is known as double bang
      setIsFollowingProfile(!!isFollowing);
    };
    if (user?.username && profileUserId) {
      isLoggedInUserFollowingProfile();
    }
  }, [user?.username, profileUserId]);

  return (
    <div className='grid grid-cols-3 gap-4 justify-between mx-auto max-w-screen-lg'>
      <div className='container flex justify-center'>
        {profileUsername ? (
          <img
            src={`/images/avatars/${profileUsername}.jpg`}
            className='rounded-full h-40 w-40 flex'
            alt={`${fullName} profile picture`}
            onError={(e) => {
              e.target.src = DEFAULT_IMAGE_PATH;
            }}
          />
        ) : (
          <Skeleton circle count={1} width={160} height={160} />
        )}
      </div>
      <div className='flex items-center justify-center flex-col col-span-2'>
        <div className='container flex items-center'>
          <p className='text-2xl font-light mr-4'>{profileUsername}</p>
          {activeBtnFollow && isFollowingProfile === null ? (
            <Skeleton count={1} width={80} height={32} />
          ) : (
            activeBtnFollow && (
              <button
                className='bg-blue-light font-bold text-sm rounded text-white w-20 h-8 focus:outline-none'
                type='button'
                onClick={handleToggleFollow}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleToggleFollow();
                  }
                }}
              >
                {isFollowingProfile ? 'Unfollow' : 'Follow'}
              </button>
            )
          )}
        </div>
        <div className='container flex mt-4'>
          {!followers || !following ? (
            <Skeleton count={1} width={677} height={24} />
          ) : (
            <>
              <p className='mr-10'>
                <span className='font-bold'>{photosCount}</span> photos
              </p>
              <p className='mr-10'>
                <span className='font-bold'>{followerCount}</span>
                {` `}
                {followerCount === 1 ? `follower` : `followers`}
              </p>
              <p className='mr-10'>
                <span className='font-bold'>{following.length}</span>
                {` `}
                following
              </p>
            </>
          )}
        </div>
        <div className='container mt-4'>
          <p className='font-medium'>
            {!fullName ? <Skeleton count={1} height={24} /> : fullName}
          </p>
        </div>
      </div>
    </div>
  );
}

Header.propTypes = {
  photosCount: PropTypes.number.isRequired,
  followerCount: PropTypes.number.isRequired,
  setFollowerCount: PropTypes.func.isRequired,
  profile: PropTypes.shape({
    docId: PropTypes.string,
    userId: PropTypes.string,
    fullName: PropTypes.string,
    username: PropTypes.string,
    followers: PropTypes.array,
    following: PropTypes.array,
  }),
};
