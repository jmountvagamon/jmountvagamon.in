import { ref, listAll, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { db, storage } from "./data/firebaseConfig";
import { Box, Group, Button, Text, TextInput, Skeleton } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import ImageBlock from "./imageBlock";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Notification } from '@mantine/core';
import { showNotification } from "@mantine/notifications";
interface MediaComponentProps {
  selectImage: (data: MediaProps) => void;
}
export default function MediaComponent({ selectImage }: MediaComponentProps) {
  const openRef = useRef<() => void>(null);
  const [mediaData, setMediaData] = useState<MediaProps[]>([]);
  const [filteredMediaData, setFilteredMediaData] = useState<MediaProps[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [images, setImages] = useState<MediaProps[]>([]);
  const [active, setActive] = useState("");
  const [refreshList, setRefreshList] = useState(false);
  const [progess, setProgess] = useState<number|null>(null);
  useEffect(() => {
    let data = [] as MediaProps[];
    const listRef = ref(storage, "");
    const run = async () => {
      let listAllVar = await listAll(listRef);
      await listAllVar.items.forEach(async (itemRef) => {
        data.push({
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          url: "",
        });
      });
      await setMediaData(data);
    };
    run();
    setRefreshList(false)
  }, [refreshList]);
  useEffect(() => {
    mediaData.map(async itemRef=>{
      await getDownloadURL(ref(storage, itemRef.fullPath)).then((r) => {
        setMediaData((p: MediaProps[]) => {
          return p.map((e) => {
            if (e?.fullPath) {
              if (e.fullPath == itemRef.fullPath) e.url = r;
            }
            return e;
          }) as unknown as MediaProps[];
        });
      });
    })
  }, [mediaData.length]);
  useEffect(() => {
    if (mediaData.length > 0) {
      let data = mediaData;
      if (filterValue) data = data.filter((e) => e.fullPath.toLowerCase().match(filterValue.toLowerCase()));
      setFilteredMediaData(data);
    }
  }, [mediaData, filterValue]);
  const saveMedia = async (files: FileWithPath[]) => {
    const storageRef = ref(storage, files[0].name);

          const uploadTask = uploadBytesResumable(storageRef, files[0]);
          showNotification({
            title: "Uploading",
            message: "Close the popup or select more",
            styles: (theme) => ({
              title: {
                fontSize: 14,
              },
              description: {
                fontSize: 10,
              },
            }),
          });
          uploadTask.on('state_changed', 
            (snapshot) => {
              setProgess((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              
              switch (snapshot.state) {
                case 'paused':
                  console.log('Upload is paused');
                  break;
                case 'running':
                  console.log('Upload is running');
                  break;
              }
            }, 
            (error) => {
            }, 
            () => {
              showNotification({
                title: "Upload complete",
                message: "Close the popup or select more",
                styles: (theme) => ({
                  title: {
                    fontSize: 14,
                  },
                  description: {
                    fontSize: 10,
                  },
                }),
              });
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                console.log('File available at', downloadURL);
                const mediaRef = doc(db, "media", files[0].name);
                setDoc(mediaRef, {
                  name: files[0].name,
                  url: downloadURL,
                  fullPath: uploadTask.snapshot.ref.fullPath,
                  timestamp: serverTimestamp()
                });
                
              });
            }
          );
          const mediasRef = ref(storage, files[0].name);
          uploadBytes(mediasRef, files[0]).then((snapshot) => {
            setRefreshList(true)
          });
        
  };
  return (
    <Box>
      <Dropzone
        openRef={openRef}
        onDrop={(files) => {
          saveMedia(files);
        }}
      >
        <Text size="sm">Drop media here / select files.</Text>
      </Dropzone>
      <Group position="center" mt="md">
        <Button
          onClick={() => {
            if (openRef != null) {
              (openRef as any).current();
            }
          }}
        >
          Select files
        </Button>
      </Group>
      <TextInput
        pt={19}
        value={filterValue}
        placeholder="Search for media"
        onChange={(value) => setFilterValue(value.currentTarget.value)}
      />
      <Button
          onClick={() => {
            setRefreshList(true)
          }}
          mt={9}
        >
          Refresh
        </Button>
      <Box mt={20}>
      <Text color="dimmed" size="sm">Hover for preview</Text>
      {filteredMediaData.length == 0 && <>
      {Array.from({length:20}).map((_,index)=>
        <Skeleton visible={true} height={134} width={102} style={{display:"inline-block",margin:10}}>
      </Skeleton>
      )}
      </>}
        {filteredMediaData.map((e, i) => (
          <Box
            onClick={() => {
              selectImage(e);
              setActive(e.fullPath);
            }}
            key={e.name}
            style={{display:"inline-block", borderRadius:30}}
          >
            <ImageBlock data={e} active={active} controls={false} images={images} setImages={setImages} setRefreshList={setRefreshList}/>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
