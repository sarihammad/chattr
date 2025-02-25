'use client';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '@/lib/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import Image from 'next/image';

export default function Auth() {
  const [user] = useAuthState(auth);

  return (
    <div className="p-4 flex flex-col items-center">
      {user ? (
        <>
          <Image
            src={user.photoURL || ''}
            alt="User Avatar"
            width={48}
            height={48}
            className="rounded-full mb-2"
          />
          <p>Welcome, {user.displayName}</p>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded mt-2"
            onClick={() => signOut(auth)}
          >
            Logout
          </button>
        </>
      ) : (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => signInWithPopup(auth, provider)}
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
