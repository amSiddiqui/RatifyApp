import { Menu, ThemeIcon } from '@mantine/core';
import React from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { AuthHelper } from '../../helpers/AuthHelper';

const BusinessLogo: React.FC<{authHelper: AuthHelper}> = ( {authHelper} ) => {
    const [image, setImage] = React.useState<string>('');
    const [lockButton, setLockButton] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const onImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files && event.currentTarget.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
                authHelper
                    .updateOrganizationLogo(reader.result as string)
                    .then(() => {
                        toast.success('Logo uploaded successfully');
                    })
                    .catch((err) => {
                        toast.error('Cannot upload logo. Try again later!');
                    });
            };
            reader.readAsDataURL(file);
        }
    };

    React.useEffect(() => {
        let shouldUpdate = true;
        authHelper
            .getOrganizationLogo()
            .then((data) => {
                if (shouldUpdate) {
                    setImage(data);
                }
            })
            .catch((err) => {
            });
        return () => {shouldUpdate = false;}
    }, [authHelper]);


    return (
        <>
            <div className="profile-picture-container">
                <img
                    src={
                        image.length === 0
                            ? '/static/img/logo-placeholder.jpg'
                            : image
                    }
                    className="object-cover w-24 h-24 shadow"
                    alt="Logo"
                />
                <span>
                    <Menu control={<ThemeIcon radius={'xl'} size='sm'><BsThreeDots></BsThreeDots></ThemeIcon>} className="relative top-11 right-4">
                        <Menu.Item
                            className="hover:bg-gray-100"
                            onClick={() => {
                                if (!lockButton) {
                                    if (fileInputRef.current) {
                                        fileInputRef.current.click();
                                    }
                                    setLockButton(true);
                                    setTimeout(() => {
                                        setLockButton(false);
                                    }, 1000);
                                }
                            }}>
                            Upload
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                if (!lockButton) {
                                    setLockButton(true);
                                    authHelper
                                        .deleteOrganizationLogo()
                                        .then(() => {
                                            setImage('');
                                        })
                                        .catch((err) => {
                                            toast.error(
                                                'Error deleting logo. Try again later',
                                            );
                                        });

                                    setTimeout(() => {
                                        setLockButton(true);
                                    }, 1000);
                                }
                            }}
                            className="hover:bg-gray-100"
                            color="red">
                            Remove
                        </Menu.Item>
                    </Menu>
                </span>
                <input
                    onChange={onImageUpload}
                    accept="image/*"
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                />
            </div>
        </>
    );
};

export default BusinessLogo;
