import subprocess
import requests
import os
from dotenv import load_dotenv
import yt_dlp

load_dotenv()
key = os.getenv('YOUTUBE_KEY')


def getSong(query, uuid):
    querySplit = query.split()

    response = requests.get(
        f'https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q={query}&key={key}')

    # print(response.json())

    for item in response.json()['items']:
        print(item['snippet']['title'])
        if all(x in item['snippet']['title'] for x in querySplit):
            subprocess.run(
                ["yt-dlp.exe", f'-o "./audio/{uuid}/%(id)s.%(ext)s"', "-f bestaudio", item['id']['videoId']], shell=True)
            break

    folder = "./ ##/audio/" + str(uuid) + "/"

    for file_name in os.listdir(folder):

        print(file_name[-4:])

        if file_name[-4:] == 'webm':
            continue

        source = folder + file_name

        new = folder + file_name[:-5] + "webm"

        os.rename(source, new)


def getSongLink(link, uuid):

    ydl_opts = {
        'format': 'bestaudio',
        # ℹ️ See help(yt_dlp.postprocessor) for a list of available Postprocessors and their arguments
        'outtmpl': f'./audio/{uuid}/%(id)s.%(ext)s'
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        error_code = ydl.download([link])

    if error_code:
        print(error_code)

    folder = "./audio/" + str(uuid) + "/"

    for file_name in os.listdir(folder):

        print(file_name[-4:])

        if file_name[-4:] == 'webm':
            continue

        source = folder + file_name

        new = folder + file_name[:-5] + "webm"

        os.rename(source, new)


def getSongInfo(query):

    response = requests.get(
        f'https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q={query}&key={key}')

    videoID = query[-11:]
    videoLink = "https://youtu.be/" + videoID

    title = ''
    artist = ''
    thumbnail = ''

    for item in response.json()['items']:
        searchVideoID = item['id']['videoId']
        if searchVideoID == videoID:
            title = item['snippet']['title']
            artist = item['snippet']['channelTitle']
            thumbnail = item['snippet']['thumbnails']['default']['url']
            break

    info = {
        "title": title,
        "artist": artist,
        "id": videoID,
        "link": videoLink,
        "thumbnail": thumbnail
    }

    return info


def getPlaylistInfo(link):

    playlistID = link[-34:]

    response = requests.get(
        f'https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId={playlistID}&key={key}')

    items = response.json()['items']

    videoInfos = []

    for item in items:
        info = {
            "title": item['snippet']['title'],
            "artist": item['snippet']['videoOwnerChannelTitle'],
            "id": item['snippet']['resourceId']['videoId'],
            "link": "https://youtu.be/" + item['snippet']['resourceId']['videoId'],
            "thumbnail": item['snippet']['thumbnails']['default']['url']
        }
        videoInfos.append(info)

    return videoInfos
