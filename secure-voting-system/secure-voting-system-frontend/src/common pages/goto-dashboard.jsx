import { Link } from 'react-router-dom';

function DashBoard() {
  return (
    <>
      <div className='flex flex-col bg-black justify-center items-center min-h-screen'>
        <div className='flex flex-col border-2 border-blue-500 p-10 rounded-lg'>
          <h2 className='text-center text-7xl mb-10 text-blue-400'>Go to</h2>
          
          <Link 
            to='/admin-login' 
            className='border-2 p-5 text-center text-5xl text-green-600 mb-10 hover:bg-blue-100 rounded-xl'>
              Admin Login
          </Link>

          <Link 
            to='/voter-login' 
            className='hover:bg-blue-100 border-2 p-5 text-center text-5xl text-green-600 rounded-xl'>
              Voter Login
          </Link>
        </div>
      </div>
    </>
  );
}

export default DashBoard;
