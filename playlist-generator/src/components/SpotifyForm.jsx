import React, { useState, useEffect } from 'react';
import '../styles/EventForm.scss';
import '../styles/HomePage.scss';

export default function SpotifyForm({ token, createPlaylist }) {
    const [artist, setArtist] = useState('');
    const [genre, setGenre] = useState('');
    const [energy, setEnergy] = useState('');
    const [danceability, setDanceability] = useState('');
    const [totalTime, setTotalTime] = useState(30);
    const [genreList, setGenreList] = useState([]);
    // const [showArtist, setShowArtist] = useState(false);

    useEffect(() => {
        const url = 'https://api.spotify.com/v1/recommendations/available-genre-seeds';
        const fetchData = async () => {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await response.json();
                setGenreList(json.genres);
            } catch (error) {
                console.log('error', error);
            }
        };
        fetchData();
    }, []);

    const getArtistCode = () => {
        const url = `https://api.spotify.com/v1/search?type=artist&q=${artist}`;
        const fetchData = async () => {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await response.json();
                // check if it even has 1 here
                finishSubmit(json.artists.items[0].id);
            } catch (error) {
                console.log('error', error);
            }
        };
        fetchData();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        getArtistCode();
    };

    const finishSubmit = (artistCode) => {
        const params = {
            seed_artists: artistCode,
            seed_genres: genre,
            target_energy: energy,
            target_danceability: danceability,
            totalTime,
            limit: 50,
        };
        createPlaylist(params);
    };

    return (
        <form className="event-form" onSubmit={handleSubmit}>
            <label htmlFor="artist">
                <span>Artist: </span>
                <input
                    id="artist"
                    type="text"
                    onChange={(e) => { setArtist(e.target.value); }}
                    value={artist}
                />
            </label>
            <div> or </div>
            <label htmlFor="genre">
                <span>Genre: </span>
                <select onChange={(e) => { setGenre(e.target.value); }}>
                    <option value=""> </option>
                    {genreList.map((e) => {
                        return <option value={e} key={e}>{e}</option>;
                    })}
                </select>
            </label>
            <label htmlFor="acoustic">
                <span>Target Energy(0 - 1): </span>
                <input
                    id="energy"
                    type="text"
                    onChange={(e) => { setEnergy(e.target.value); }}
                    value={energy || ''}
                />
            </label>
            <label htmlFor="danceability">
                <span>Target Danceability(0 - 1): </span>
                <input
                    id="danceability"
                    type="text"
                    onChange={(e) => { setDanceability(e.target.value); }}
                    value={danceability || ''}
                />
            </label>
            <label htmlFor="totalTime">
                <span>Total Time(minutes): </span>
                <select onChange={(e) => { setTotalTime(e.target.value); }}>
                    <option value="30">30</option>
                    <option value="45">45</option>
                    <option value="60">60</option>
                    <option value="90">90</option>
                </select>
            </label>
            <button type="submit" className="button">Create Playlist</button>
        </form>
    );
}
