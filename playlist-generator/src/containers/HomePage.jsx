import React, {
    useCallback, useContext, useState,
} from 'react';
import { Redirect } from 'react-router-dom';
import { spotifyAppContext } from '../utils/Context';
import '../styles/HomePage.scss';
import { UserComp } from '../components';
import SpotifyForm from '../components/SpotifyForm';
import Modal from '../components/Modal';

export const HomePage = () => {
    const context = useContext(spotifyAppContext);
    const { user, token } = context;
    const [playlist, setPlaylist] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [description, setDescription] = useState('');
    const [success, setSuccess] = useState(false);

    if (!user || !token) {
        // User is NOT logged in, take the user to the login page
        return (
            <Redirect to="/login" />
        );
    }

    const addToPlaylist = (list, totalTime) => {
        let timeMS = totalTime * 60000;
        Object.keys(list).every((key) => {
            addSong({
                name: list[key].name,
                artists: list[key].artists[0].name,
                album: list[key].album.name,
                releaseDate: list[key].album.release_date,
                image: list[key].album.images[0].url,
                id: list[key].id,
            });
            timeMS -= list[key].duration_ms;
            if (timeMS <= 0) {
                return false;
            }
            return true;
        });
    };

    const addSong = (song) => {
        setPlaylist((prevSongs) => {
            return [...prevSongs, song];
        });
    };

    const createPlaylist = useCallback((params) => {
        const url = new URL('https://api.spotify.com/v1/recommendations');
        Object.keys(params).forEach((key) => {
            if (params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });

        const getRecommendations = async () => {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await response.json();
                addToPlaylist(json.tracks, params.totalTime);
                // check if it even has 1 here
                setShowModal(true);
            } catch (error) {
                console.log('error', error);
            }
        };
        getRecommendations();
    }, []);

    const makePlaylist = () => {
        const url = new URL(`https://api.spotify.com/v1/users/${user.id}/playlists`);

        const generatePlaylist = async () => {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        name: newPlaylistName,
                        description,
                        public: false,
                    }),
                });
                const json = await response.json();
                fillNewPlaylist(json.id);
                // check if it even has 1 here
            } catch (error) {
                console.log('error', error);
            }
        };
        generatePlaylist();
    };

    const fillNewPlaylist = (id) => {
        const url = new URL(`https://api.spotify.com/v1/playlists/${id}/tracks`);
        let uris = [];
        Object.keys(playlist).forEach((song) => {
            uris = [...uris, `spotify:track:${playlist[song].id}`];
        });
        const sendPlaylistData = async () => {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        uris,
                    }),
                });
                const json = await response.json();
                console.log(json);
                setShowModal(false);
                setSuccess(true);
                // check if it even has 1 here
            } catch (error) {
                console.log('error', error);
            }
        };
        sendPlaylistData();
    };

    return (
        <div className="home-page">
            <div>
                <UserComp user={user} />
                {success && (
                    <span className="success">Success!</span>
                )}
            </div>
            <SpotifyForm token={token} createPlaylist={createPlaylist} />
            {showModal && (
                <Modal>
                    <div>
                        <input placeholder="New Playlist Name" onChange={(e) => { setNewPlaylistName(e.target.value); }} value={newPlaylistName} />
                        <input placeholder="Description" onChange={(e) => { setDescription(e.target.value); }} value={description} />
                        <button onClick={makePlaylist} className="button" type="button">Add Playlist</button>
                        <button onClick={() => { setShowModal(false); setPlaylist([]); }} className="button close" type="button">Close</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Artists</th>
                                <th>Album</th>
                                <th>Release Date</th>
                                <th>Album Artwork</th>
                            </tr>
                        </thead>
                        {playlist.map((song) => {
                            return (
                                <React.Fragment key={song.id}>
                                    <tbody>
                                        <tr>
                                            <td>{song.name}</td>
                                            <td>{song.artists}</td>
                                            <td>{song.album}</td>
                                            <td>{song.releaseDate}</td>
                                            <td>
                                                <img src={song.image} alt="album artwork" width="200" height="200" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </React.Fragment>
                            );
                        })}
                    </table>
                </Modal>
            )}
        </div>
    );
};
