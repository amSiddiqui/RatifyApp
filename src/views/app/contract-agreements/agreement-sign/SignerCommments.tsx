import { Center, Group, List, Loader, Menu, Textarea } from '@mantine/core';
import { Button } from 'reactstrap';
import React from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { SignerComment } from '../../../../types/ContractTypes';
import { ContractHelper } from '../../../../helpers/ContractHelper';
import { toast } from 'react-toastify';
import { getLastSeenFromDate } from '../../../../helpers/Utils';

type Props = {
    contractHelper: ContractHelper;
    token: string;
    signerId?: number;
    userId?: number;
}

const getCommentUser = (key: string, c: SignerComment)  => {
    if (key === 'signer') {
        return c.signerId;
    } else {
        return c.userId;
    }
}

const SignerComments:React.FC<Props> = ({ contractHelper, token, signerId, userId }) => {
    const [[key, id]] = React.useState<[string, number]>(() => {
        if (signerId) {
            return ['signer', signerId];
        } else if (userId){
            return ['user', userId];
        } else {
            return ['', -1];
        }
    });
    const [commenting, setCommenting] = React.useState(false);
    const [comment, setComment] = React.useState('');
    const [comments, setComments] = React.useState<SignerComment[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const [editingComment, setEditingComment] = React.useState(false);
    const [commentEdit, setCommentEdit] = React.useState('');


    const createComment = () => {
        if (comment.trim() === '') {
            return;
        }
        setCommenting(false);
        contractHelper.createSignerComment(token, comment).then(resp => {
            setComments(prev => {
                return [resp.data, ...prev];
            });
            setComment('');
        }).catch(err => {
            toast.error('Cannot create comment. Try again later!');
        });
    }

    React.useEffect(() => {
        if (token && contractHelper) {
            contractHelper.getSignerComments(token).then(resp => {
                setComments(resp.data);
            }).catch(err => {
                console.log(err);
                setError(true);
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [contractHelper, token]);

    return (<>
        <Textarea disabled={error || loading} autosize maxRows={12} onFocus={() => {
            setCommenting(true);
        }} value={comment} onChange={(e) => {
            setComment(e.currentTarget.value);
        }} onBlur={() => {
            if (comment.length === 0) {
                setCommenting(false);
            }
        }} placeholder='Add a comment' variant='unstyled' className='px-3 border-b-2' />
        {commenting && <div className='flex mt-2 justify-end'>
            <span onClick={() => {
                setCommenting(false);
                setComment('');
            }}><Button size='xs' color='light'>Cancel</Button></span>
            <span onClick={createComment} className='ml-2'><Button size='xs' color='success'>Comment</Button></span>
        </div>}

        {!loading && !error && (<>
            {comments.length === 0 && 
            <Center className='mt-4 px-4'>
                <p className='text-muted'>Currently there is no communication associated with this comment.</p>
            </Center>}
            {comments.length > 0 && <>
                <List className='mt-5 px-4' icon={<i className='simple-icon-bubbles text-primary text-2xl' />}>
                    {comments.map((c) => {
                        return (
                            <List.Item key={c.id}>
                                <div>
                                    <Group position='apart'>
                                        <p className='text-sm'>{c.signer.length > 0 ? c.signer : c.user} <span className='ml-1 text-muted'>{getLastSeenFromDate(c.created_at)}</span></p>
                                        {getCommentUser(key, c) === id && !editingComment && <Menu position='right' size='xs'>
                                            <Menu.Label>Settings</Menu.Label>
                                            <Menu.Item onClick={() => {
                                                setEditingComment(true);
                                                setCommentEdit(c.comment);
                                            }} icon={ <AiOutlineEdit /> }>Edit</Menu.Item>
                                            <Menu.Item onClick={() => {
                                                contractHelper.deleteSignerComment(token, c.id).then(resp => {
                                                    setComments(prev => prev.filter(cm => cm.id !== c.id));
                                                }).catch(err => {
                                                    toast.error('Cannot delete comment. Try again later!');
                                                });
                                            }} icon={ <AiOutlineDelete /> } color='red'>Delete</Menu.Item>
                                        </Menu>}
                                    </Group>
                                    {!editingComment && <p className='mt-1'>{c.comment}</p>}
                                    {editingComment && <div>
                                        <Textarea value={commentEdit} onChange={(e) => {
                                            setCommentEdit(e.currentTarget.value);
                                        }} autosize maxRows={12} />
                                        <Group className='mt-2' position='right'>
                                            <div>
                                                <span onClick={() => {
                                                    setEditingComment(false);
                                                    setCommentEdit('');
                                                }}><Button color='light' size='xs'>Cancel</Button></span>
                                                <span onClick={() => {
                                                    contractHelper.updateSignerComment(token, c.id, commentEdit).then(resp => {
                                                        setComments(prev => {
                                                            const newComments = [...prev];
                                                            const index = newComments.findIndex(cm => cm.id === c.id);
                                                            newComments[index].comment = commentEdit;
                                                            return newComments;
                                                        });
                                                        setEditingComment(false);
                                                    }).catch(err => {
                                                        toast.error('Cannot update comment. Try again later!');
                                                        setEditingComment(false);
                                                    });
                                                }} className='ml-2'><Button color='success' size='xs'>Save</Button></span>
                                            </div>
                                        </Group>
                                            
                                    </div>
                                    }
                                </div>
                            </List.Item>
                        )
                    })}
                </List>
            </>}
        </>
        )}
        {loading && (<>
            <Center className='mt-4 px-4'><Loader /></Center>
        </>)}
        {error && (<Center className='mt-4 px-4'>
            <p className='text-muted'>Cannot Load Comments at the moment.</p>
        </Center>)}
        
    </>);
}

export default SignerComments;