import React, { useEffect } from 'react';
import { Card, CardTitle, CardBody } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import IntlMessages from '../../helpers/IntlMessages';
import { adminRoot } from '../../constants/defaultValues';
import { Center, Image } from '@mantine/core';

const Error:React.FC = () => {
  useEffect(() => {
    document.body.classList.add('background');
    document.body.classList.add('no-footer');

    return () => {
      document.body.classList.remove('background');
      document.body.classList.remove('no-footer');
    };
  }, []);

  return (
    <>
      <div className="fixed-background" />
      <main>
        <div className="container">
          <Center className='h-screen'>
            <Card style={{ minWidth: '60%' }}>
              <CardBody>
              <Center>
                  <div className='py-8'>
                    <Center>
                      <Image className='mb-4 w-[170px] cursor-pointer sm:w-[200px]' src='/static/logos/black.png' alt='Ratify' />
                    </Center>
                    <CardTitle className="mb-4 text-center">
                      <IntlMessages id="pages.error-title" />
                    </CardTitle>
                    <p className="text-muted text-center text-small mb-0">
                      <IntlMessages id="pages.error-code" />
                    </p>
                    <p className="display-1 text-center font-weight-bold mb-5">404</p>
                    <Center>
                      <NavLink
                        to={adminRoot}
                        className="btn btn-primary btn-shadow btn-lg"
                      >
                        <IntlMessages id="pages.go-back-home" />
                      </NavLink>
                    </Center>
                  </div>

                </Center>
              
              </CardBody>
            </Card>
          </Center>
        </div>
      </main>
    </>
  );
};

export default Error;
